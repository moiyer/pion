dojo.registerModulePath("pion", "/scripts");
dojo.registerModulePath("plugins", "/plugins");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.dtl.filter.strings");
dojo.require("dojo.parser");	// scan page for widgets and instantiate them
dojo.require("pion._base");
dojo.require("pion.reactors");
dojo.require("pion.vocabularies");
dojo.require("pion.codecs");
dojo.require("pion.databases");
dojo.require("pion.protocols");
dojo.require("pion.users");
dojo.require("pion.system");
dojo.require("pion.login");
dojo.require("pion.terms");
dojo.require("pion.services");
dojo.require("pion.about");
dojo.require("pion.widgets.Wizard");
dojo.require("pion.widgets.LicenseKey");
dojo.require("pion.widgets.EditionSelector");
dojo.requireLocalization("pion", "wizard");

var reactor_config_page_initialized = false;
var vocab_config_page_initialized = false;
var codec_config_page_initialized = false;
var database_config_page_initialized = false;
var protocol_config_page_initialized = false;
var user_config_page_initialized = false;
var system_config_page_initialized = false;
var file_protocol = false;
var firefox_on_mac;

pion.doDeleteConfirmationDialog = function(message, delete_function, delete_function_arg) {
	var dialog = pion.delete_confirmation_dialog;
	if (!dialog) {
		dialog = new dijit.Dialog({
			title: 'Delete Confirmation',
			content: '<div id="are_you_sure"></div>'
					 + '<button id="cancel_delete" dojoType="dijit.form.Button" class="cancel">Cancel</button>'
					 + '<button id="confirm_delete" dojoType=dijit.form.Button class="delete">Delete</button>'
		});

		dojo.byId('cancel_delete').onclick = function() { dialog.onCancel(); };

		// Save for future use.
		pion.delete_confirmation_dialog = dialog;
	}
	dojo.byId('are_you_sure').innerHTML = message;
	dojo.byId('confirm_delete').onclick = function() { dialog.onCancel(); delete_function(delete_function_arg); };
	dialog.show();
	setTimeout("dijit.byId('cancel_delete').focus()", 500);
}

pion.initOptionalValue = function(store, item, new_item_object, tag_name, optional_default) {
	if (store.hasAttribute(item, tag_name)) {
		new_item_object[tag_name] = store.getValue(item, tag_name);
	} else if (optional_default !== undefined) {
		new_item_object[tag_name] = optional_default;
	}
}

// Contains ids of all the children of 'main_stack_container' in index.html.
pion.resources_by_tab_id = {
	reactor_config:  '/config/reactors',
	vocab_config:    '/config/vocabularies',
	codec_config:    '/config/codecs',
	database_config: '/config/databases',
	protocol_config: '/config/protocols',
	user_config:     '/config/users',
	system_config:   '/config'
};

// This is called by pion.services.init(), since the latter may (indirectly) add to pion.resources_by_tab_id.
pion.initTabs = function() {
	dojo.xhrGet({
		url: '/config/users/' + dojo.cookie('user'),
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			var main_stack = dijit.byId('main_stack_container');
			var permitted_resources = dojo.map(response.getElementsByTagName('Permit'), function(resource) {
				return dojo.isIE? resource.childNodes[0].nodeValue : resource.textContent;
			});

			// TODO: it would be a lot nicer to add only the permitted tabs, instead of creating
			// all of them and then deleting the ones not found on the list of permitted tabs.
			for (var tab_id in pion.resources_by_tab_id) {
				if (dojo.indexOf(permitted_resources, pion.resources_by_tab_id[tab_id]) == -1) {
					main_stack.removeChild(dijit.byId(tab_id));
				}
			}

			var tabs = main_stack.getChildren();
			if (tabs.length > 0) {
				main_stack.selectChild(tabs[0]);
				configPageSelected(tabs[0]);
			} else {
				alert('There are no access rights defined for this user account.  You may need to reset your users.xml file.');
			}

			// Don't be tempted to move this earlier to avoid calling configPageSelected() above:
			// selectChild(page) won't trigger configPageSelected(page) if page was already selected.
			dojo.subscribe("main_stack_container-selectChild", configPageSelected);

			return response;
		}
	});
	pion.tab_ids_by_resource = {};
	for (var tab_id in pion.resources_by_tab_id) {
		pion.tab_ids_by_resource[pion.resources_by_tab_id[tab_id]] = tab_id;
	}
}

pion.applyTemplatesIfNeeded = function(wizard_config) {
	var dfd = new dojo.Deferred();
	
	if (pion.edition != 'Replay') {
		dfd.callback(wizard_config);
		return dfd;
	}

	var labels = dojo.map(wizard_config.reactors, function(item) {return item.label});
	var mdr_index = dojo.indexOf(labels, 'mdr');
	dojo.xhrGet({
		url: '/resources/MDRTemplate.tmpl',
		handleAs: 'text',
		timeout: 20000,
		load: function(response, ioArgs) {
			wizard_config.reactors[mdr_index].config += dojo.string.substitute(
				response,
				{
					MaxDiskUsage: pion.wizard.max_disk_usage
				}
			);
			dfd.callback(wizard_config);

			return response;
		},
		error: pion.handleXhrGetError
	});

	return dfd;
}

pion.addReactorsFromWizard = function(wizard_config) {
	var dfd = new dojo.Deferred();
	
	if (wizard_config.reactors.length == 0) {
		dfd.callback(wizard_config);
		return dfd;
	}

	var num_reactors_added = 0;
	var _this = this;
	wizard_config.reactor_ids = {};
	var post_data_header = '<PionConfig><Reactor><Workspace>' + wizard_config.workspace_name + '</Workspace>';
	dojo.forEach(wizard_config.reactors, function(reactor) {
		var post_data = post_data_header + reactor.config + '</Reactor></PionConfig>';  
		dojo.rawXhrPost({
			url: '/config/reactors',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response) {
				var node = response.getElementsByTagName('Reactor')[0];
				wizard_config.reactor_ids[reactor.label] = node.getAttribute('id');
				if (++num_reactors_added == wizard_config.reactors.length) {
					dfd.callback(wizard_config);
				}
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	});

	return dfd;
}

pion.addConnectionsFromWizard = function(wizard_config) {
	var dfd = new dojo.Deferred();
	
	if (wizard_config.connections.length == 0)
		dfd.callback(wizard_config);

	var num_connections_added = 0;
	var _this = this;
	dojo.forEach(wizard_config.connections, function(connection) {
		var post_data = '<PionConfig><Connection><Type>reactor</Type>'
			+ '<From>' + wizard_config.reactor_ids[connection.from] + '</From>'
			+ '<To>' + wizard_config.reactor_ids[connection.to] + '</To>'
			+ '</Connection></PionConfig>';  
		dojo.rawXhrPost({
			url: '/config/connections',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response) {
				if (++num_connections_added == wizard_config.connections.length) {
					dfd.callback(wizard_config);
				}
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	});

	return dfd;
}

pion.addReplayIfNeeded = function(wizard_config) {
	var dfd = new dojo.Deferred();
	
	if (pion.edition != 'Replay') {
		dfd.callback(wizard_config);
		return dfd;
	}

	var replay_config = 
		'<Name>Replay Query Service</Name>' +
		'<Comment>Pion Replay query service</Comment>' +
		'<Plugin>ReplayService</Plugin>' +
		'<Resource>/replay</Resource>' +
		'<Server>main-server</Server>' +
		'<Namespace id="0">' +
			'<Comment>Default Instance</Comment>' +
			'<MultiDatabaseOutputReactor>' + wizard_config.reactor_ids['mdr'] + '</MultiDatabaseOutputReactor>' +
		'</Namespace>';

	var post_data = '<PionConfig><PlatformService>' + replay_config + '</PlatformService></PionConfig>';  
	dojo.rawXhrPost({
		url: '/config/services',
		contentType: "text/xml",
		handleAs: "xml",
		postData: post_data,
		load: function(response) {
			var node = response.getElementsByTagName('PlatformService')[0];
			dfd.callback(wizard_config);
			return response;
		},
		error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
	});

	return dfd;
}

pion.wizardDone = function(exit_early) {
	dojo.addClass('wizard', 'hidden');
	dojo.byId('outer').style.visibility = 'visible';
	dojo.byId('current_user_menu_section').style.visibility = 'visible';
	dojo.byId('current_user').innerHTML = dojo.cookie('user');

	if (exit_early) {
		pion.setup_success_callback();
		return;
	}

	var sniffer_config =
								'<Plugin>SnifferReactor</Plugin>'
								+ '<X>50</X>'
								+ '<Y>100</Y>'
								+ '<Name>Capture Traffic</Name>'
								+ '<Comment>Captures raw network traffic to generate HTTP request events</Comment>'
								+ '<Protocol>' + pion.protocols.default_id + '</Protocol>'
								+ '<ProcessingThreads>3</ProcessingThreads>'
								+ '<MaxPacketQueueSize>100000</MaxPacketQueueSize>'
								+ '<QueueEventDelivery>true</QueueEventDelivery>';
	dojo.forEach(pion.wizard.devices, function(device) {
		var tcp_ports = dojo.map(pion.wizard.ports, function(item) {return 'tcp port ' + item});
		sniffer_config += '<Capture><Interface>' + device + '</Interface><Filter>';
		sniffer_config += tcp_ports.join(' or ');
		sniffer_config += '</Filter></Capture>';
	});

	var clickstream_config =
		'<Plugin>ClickstreamReactor</Plugin>' + 
		'<X>250</X>' +
		'<Y>200</Y>' +
		'<Name>Sessionize Traffic</Name>' +
		'<Comment>Sessionizes HTTP traffic into page views and visitor sessions</Comment>' +
		'<SessionTimeout>1800</SessionTimeout>' +
		'<PageTimeout>10</PageTimeout>' +
		'<MaxOpenPages>5</MaxOpenPages>' +
		'<MaxOpenEvents>100</MaxOpenEvents>' +
		'<IgnoreRobotTraffic>true</IgnoreRobotTraffic>' +
		'<UseEventTimeForTimeouts>false</UseEventTimeForTimeouts>' +
		'<AnonPersistence>false</AnonPersistence>' +
		'<CookiePersistence>true</CookiePersistence>' +
		'<SessionGroup id="default">' +
			'<Name>Default Group</Name>' +
			'<Cookie type="s">__utma</Cookie>' +
			'<Cookie type="v">__utmz</Cookie>' +
			'<Cookie type="v">s_vi</Cookie>' +
		'</SessionGroup>';
	if (pion.wizard.host_suffixes.length > 0) {
		var pieces_of_first_host_suffix = pion.wizard.host_suffixes[0].split('.');
		var num_pieces = pieces_of_first_host_suffix.length;
		var session_group_name = pieces_of_first_host_suffix[num_pieces == 1? 0 : num_pieces - 2];
		clickstream_config +=
			'<SessionGroup id="' + session_group_name + '">' +
				'<Name>' + session_group_name + '</Name>';
		dojo.forEach(pion.wizard.host_suffixes, function(host) {
			clickstream_config += '<Host>' + dojo.trim(host) + '</Host>';
		});
		dojo.forEach(pion.wizard.cookies, function(cookie) {
			clickstream_config += '<Cookie type="' + (cookie.is_visitor_cookie? 'v' : 's') + '">' + cookie.name + '</Cookie>';
		});
		clickstream_config +=
			'</SessionGroup>';
	}
	clickstream_config +=
		'<PageObjects>' +
			'<MatchAllComparisons>false</MatchAllComparisons>' +
			'<Comparison>' +
				'<Term>urn:vocab:clickstream#uri-stem</Term>' +
				'<Type>regex</Type>' +
				'<Value>\.(gif|jpg|jpeg|png|ico|css|js|swf)$</Value>' +
				'<MatchAllValues>false</MatchAllValues>' +
			'</Comparison>' +
			'<Comparison>' +
				'<Term>urn:vocab:clickstream#content-type</Term>' +
				'<Type>regex</Type>' +
				'<Value>(image/|application/|text/css|text/plain|javascript|xml|json)</Value>' +
				'<MatchAllValues>false</MatchAllValues>' +
			'</Comparison>' +
		'</PageObjects>';
	if (pion.wizard.analytics_provider == 'Omniture') {
		var analytics_config =
			'<Plugin>OmnitureAnalyticsReactor</Plugin>' + 
			'<X>250</X>' +
			'<Y>300</Y>' +
			'<Name>Omniture Analytics</Name>' +
			'<NumConnections>32</NumConnections>' +
			'<HttpHost>' + pion.wizard.omniture_host + '</HttpHost>' +
			'<AccountId>' + pion.wizard.omniture_report_suite + '</AccountId>' +
			'<EncryptConnections>false</EncryptConnections>' +
			'<SendTimestamp>true</SendTimestamp>' +
			'<Query name="ipaddress">urn:vocab:clickstream#c-ip</Query>' +
			'<Query name="userAgent">urn:vocab:clickstream#useragent</Query>' +
			'<Query name="pageName">urn:vocab:clickstream#page-title</Query>' +
			'<Query name="referrer">urn:vocab:clickstream#referer</Query>' +
			'<Query name="visitorID">[computed]</Query>' +
			'<Query name="server">[computed]</Query>' +
			'<Query name="pageURL">[computed]</Query>' +
			'<Query name="timestamp">[computed]</Query>' +
			'<Query name="reportSuiteID">[computed]</Query>';
	} else if (pion.wizard.analytics_provider == 'Webtrends') {
		var analytics_config =
			'<Plugin>WebTrendsAnalyticsReactor</Plugin>' + 
			'<X>250</X>' +
			'<Y>300</Y>' +
			'<Name>WebTrends Analytics</Name>' +
			'<AccountId>' + pion.wizard.webtrends_account_id + '</AccountId>' +
			'<NumConnections>32</NumConnections>' +
			'<EncryptConnections>false</EncryptConnections>';
	} else if (pion.wizard.analytics_provider == 'Google') {
		var analytics_config =
			'<Plugin>GoogleAnalyticsReactor</Plugin>' + 
			'<X>250</X>' +
			'<Y>300</Y>' +
			'<Name>Google Analytics</Name>' +
			'<AccountId>' + pion.wizard.google_account_id + '</AccountId>' +
			'<NumConnections>32</NumConnections>' +
			'<EncryptConnections>false</EncryptConnections>';
	} else if (pion.wizard.analytics_provider == 'Unica') {
		var analytics_config =
			'<Plugin>UnicaAnalyticsReactor</Plugin>' + 
			'<X>250</X>' +
			'<Y>300</Y>' +
			'<Name>Unica OnDemand</Name>' +
			'<AccountId>' + pion.wizard.unica_account_id + '</AccountId>' +
			'<NumConnections>32</NumConnections>' +
			'<EncryptConnections>false</EncryptConnections>';
	} else {
		// TODO:
	}

	if (pion.edition == 'Replay') {
		var chr_config = 
			'<Plugin>ContentHashReactor</Plugin>' + 
			'<X>250</X>' + 
			'<Y>100</Y>' + 
			'<Name>Detect Page Content</Name>' + 
			'<SourceTerm>urn:vocab:clickstream#sc-content</SourceTerm>' + 
			'<MatchAllComparisons>true</MatchAllComparisons>' + 
			'<Comment>Looks for page content in HTTP events that will be stored for Replay</Comment>' + 
			'<Comparison>' + 
				'<Term>urn:vocab:clickstream#status</Term>' + 
				'<Type>equals</Type>' + 
				'<Value>200</Value>' + 
				'<MatchAllValues>false</MatchAllValues>' + 
			'</Comparison>' + 
			'<Comparison>' + 
				'<Term>urn:vocab:clickstream#content-type</Term>' + 
				'<Type>starts-with</Type>' + 
				'<Value>text/html</Value>' + 
				'<MatchAllValues>false</MatchAllValues>' + 
			'</Comparison>';

		// The remainder will be added in pion.applyTemplatesIfNeeded().
		var mdr_config = 
			'<X>450</X>' + 
			'<Y>200</Y>';

		var reactors = [
			{label: 'sniffer', config: sniffer_config},
			{label: 'chr', config: chr_config},
			{label: 'clickstream', config: clickstream_config},
			{label: 'mdr', config: mdr_config}
		];
		var connections = [
			{from: 'sniffer', to: 'chr'},
			{from: 'chr', to: 'clickstream'},
			{from: 'clickstream', to: 'mdr'}
		];

	} else {
		var reactors = [
			{label: 'sniffer', config: sniffer_config},
			{label: 'clickstream', config: clickstream_config}
		];
		var connections = [
			{from: 'sniffer', to: 'clickstream'}
		];
	}

	if (analytics_config) {
		reactors.push({label: 'analytics', config: analytics_config});
		connections.push({from: 'clickstream', to: 'analytics'});
	}
	wizard_config = {reactors: reactors, connections: connections, workspace_name: 'Clickstream'};
	if (pion.wizard.host_suffixes.length > 0) {
		// This is the same algorithm as used to compute session_group_name, but it could be different.
		var pieces_of_first_host_suffix = pion.wizard.host_suffixes[0].split('.');
		var num_pieces = pieces_of_first_host_suffix.length;
		var prefix = pieces_of_first_host_suffix[num_pieces == 1? 0 : num_pieces - 2];

		wizard_config.workspace_name = dojox.dtl.filter.strings.capfirst(prefix) + ' Clickstream';
	}

	pion.applyTemplatesIfNeeded(wizard_config)
	.addCallback(pion.addReactorsFromWizard)
	.addCallback(pion.addConnectionsFromWizard)
	.addCallback(pion.addReplayIfNeeded)
	.addCallback(pion.setup_success_callback);
}

pion.checkEdition = function() {
	var form = dijit.byId('select_edition_form');
	pion.edition = form.attr('value').edition;
	if (pion.edition) {
		dojo.cookie('pion_edition', pion.edition);
		pion.widgets.Wizard.prepareLicensePane();
		return true;
	} else {
		return "Please select an edition.";
	}


	//if (pion.edition) {
	//	dojo.cookie('pion_edition', pion.edition);
	//	var template = dojo.byId('wizard_warning').innerHTML;
	//	dojo.byId('wizard_warning').innerHTML = dojo.string.substitute(
	//		template,
	//		{
	//			Edition: pion.edition,
	//			RecommendedRAM: 99, 
	//			RecommendedDiskSpace: 99
	//		}
	//	);
	//	return true;
	//} else {
	//	return "Please select an edition.";
	//}
}

pion.setup_success_callback = function() {
	pion.terms.init();
	pion.services.init();
}

pion.editionSetup = function(license_key_type) {
	pion.wizard = dijit.byId('wizard');

	// Overrides dijit.layout.StackContainer.back()
	pion.wizard.back = function() {
		if (pion.wizard.selectedChildWidget.returnPane) {
			pion.wizard.selectChild(dijit.byId(pion.wizard.selectedChildWidget.returnPane));
		} else {
			this.selectChild(this._adjacent(false));
		}
	}

	pion.wizard_nlsStrings = dojo.i18n.getLocalization("pion", "wizard");

	dojo.xhrGet({
		url: '/config/reactors',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			// The user must be logged in since the request succeeded.
			dojo.cookie("logged_in", "true", {expires: 1}); // 1 day

// TODO:
// The 'pion_edition' cookie should never be saved unless the user accepts the corresponding license.
// So, presence of the 'pion_edition' cookie is evidence that the user did accept the corresponding license.
// However, the presence of a valid license is *not* such evidence, since they could have created the file 'license.key' themselves.
// So, if a license key is found, do we still need to check for the 'pion_edition' cookie, and prompt for license agreement if it's missing?
// (Note that this will also give us the opportunity to create the cookie.)

			var reactors = response.getElementsByTagName('Reactor');
			if (reactors.length) {
				if (license_key_type == 'enterprise' || license_key_type == 'replay') {
					// After pion.initTabs() is called, the Reactors tab will be selected, unless
					// a Replay service is configured, in which case the Replay tab will be selected.
					dojo.byId('wizard').style.display = 'none';
					dojo.byId('outer').style.visibility = 'visible';
					dojo.byId('current_user_menu_section').style.visibility = 'visible';
					dojo.byId('current_user').innerHTML = dojo.cookie('user');
					pion.setup_success_callback();
				} else { // license_key_type == 'none'
					if (dojo.cookie('pion_edition')) {
						pion.edition = dojo.cookie('pion_edition');
					}
					if (pion.edition == 'Core' || pion.edition == 'Lite') {
						dojo.byId('wizard').style.display = 'none';
						dojo.byId('outer').style.visibility = 'visible';
						dojo.byId('current_user_menu_section').style.visibility = 'visible';
						dojo.byId('current_user').innerHTML = dojo.cookie('user');
						pion.setup_success_callback();
					} else {
						var dialog = new pion.widgets.EditionSelectorDialog;
						dialog.show();
					}
				}
			} else {
				var wizard = dijit.byId('wizard');
				dojo.removeClass('wizard', 'hidden');

				pion.wizard.cookies = [];
				pion.wizard.devices = [];
				pion.wizard.max_disk_usage = 'NA';

				// Since there are no reactors configured, any ReplayService that is configured is useless, so delete it.
				pion.services.config_store.fetch({
					onItem: function(item) {
						var plugin = pion.services.config_store.getValue(item, 'Plugin');
						if (plugin == 'ReplayService') {
							var id = pion.services.config_store.getValue(item, '@id');
							dojo.xhrDelete({
								url: '/config/services/' + id,
								handleAs: 'xml',
								timeout: 5000,
								load: function(response, ioArgs) {
									return response;
								},
								error: pion.getXhrErrorHandler(dojo.xhrDelete)
							});
						}
					},
					onError: pion.handleFetchError
				});

				// This doesn't work: for some reason, it makes the radio buttons unselectable.
				//var template = dojo.byId('select_analytics_provider_form').innerHTML;
				//dojo.byId('select_analytics_provider_form').innerHTML = dojo.string.substitute(
				//	template,
				//	{
				//		omniture_label: pion.wizard_nlsStrings.omniture_label,
				//		webtrends_label: pion.wizard_nlsStrings.webtrends_label,
				//		google_label: pion.wizard_nlsStrings.google_label, 
				//		unica_label: pion.wizard_nlsStrings.unica_label
				//	}
				//);
				dojo.forEach(dojo.query('label', dojo.byId('select_analytics_provider_form')), function(node) {
					node.innerHTML = dojo.string.substitute(
						node.innerHTML,
						{
							omniture_label: pion.wizard_nlsStrings.omniture_label,
							webtrends_label: pion.wizard_nlsStrings.webtrends_label,
							google_label: pion.wizard_nlsStrings.google_label, 
							unica_label: pion.wizard_nlsStrings.unica_label
						}
					);
				});

				// Pre-select an edition if a pion_edition cookie is found, or failing that, a license key.
				if (dojo.cookie('pion_edition')) {
					pion.edition = dojo.cookie('pion_edition');
					dijit.byId('select_edition_form').attr('value', {edition: pion.edition});
				} else if (license_key_type == 'enterprise') {
					dijit.byId('select_edition_form').attr('value', {edition: 'Enterprise'});
				} else if (license_key_type == 'replay') {
					dijit.byId('select_edition_form').attr('value', {edition: 'Replay'});
				}

				// Assign next-button label for page 1 (which was already selected).
				var first_page = wizard.selectedChildWidget;
				dojo.forEach(dojo.query('.next_button', first_page.domNode), function(node) {
					wizard.nextButton.attr('label', node.innerHTML);
				});

				dojo.subscribe('wizard-selectChild', function(page) {
					dojo.forEach(dojo.query('.prev_button', page.domNode), function(node) {
						wizard.previousButton.attr('label', node.innerHTML);
						if (node.getAttribute('returnPane'))
							page.returnPane = node.getAttribute('returnPane');
					});
					dojo.forEach(dojo.query('.next_button', page.domNode), function(node) {
						wizard.nextButton.attr('label', node.innerHTML);
					});
					var edition_specific_query = '.next_button_' + pion.edition.toLowerCase();
					dojo.forEach(dojo.query(edition_specific_query, page.domNode), function(node) {
						wizard.nextButton.attr('label', node.innerHTML);
					});
					dojo.forEach(dojo.query('.done_button', page.domNode), function(node) {
						wizard.doneButton.attr('label', node.innerHTML);
					});

					if (page.id == 'capture_devices_pane') {
						if (! page.device_list_initialized) {
							// Create a temporary dummy SnifferReactor.
							var post_data = '<PionConfig><Reactor>'
								+ '<Plugin>SnifferReactor</Plugin>'
								+ '<Protocol>' + pion.protocols.default_id + '</Protocol>'
								+ '</Reactor></PionConfig>';  
							dojo.rawXhrPost({
								url: '/config/reactors',
								contentType: "text/xml",
								handleAs: "xml",
								postData: post_data,
								load: function(response) {
									var node = response.getElementsByTagName('Reactor')[0];
									var id = node.getAttribute('id');

									// Create an XML data store with all available interfaces, then use them to populate the Capture Devices pane.
									var interface_xml_store = new dojox.data.XmlStore({url: '/query/reactors/' + id + '/interfaces'});
									var device_list_div = dojo.byId('device_list');
									interface_xml_store.fetch({
										query: {tagName: 'Interface'},
										onItem: function(item) {
											var device_name = interface_xml_store.getValue(item, 'Name');
											var description = interface_xml_store.getValue(item, 'Description');

											var check_box_div = document.createElement('div');
											device_list_div.appendChild(check_box_div);
											new dijit.form.CheckBox({name: 'device_check_boxes', value: device_name}, check_box_div);
											var description_span = dojo.create('span', {innerHTML: description});
											device_list_div.appendChild(description_span);
											device_list_div.appendChild(dojo.create('br'));
											var device_label = dojo.create('label', {innerHTML: device_name});
											device_list_div.appendChild(device_label);
											device_list_div.appendChild(dojo.create('br'));
										},
										onComplete: function() {
											// Delete the dummy SnifferReactor.
											dojo.xhrDelete({
												url: '/config/reactors/' + id,
												handleAs: 'xml',
												timeout: 5000,
												load: function(response, ioArgs) {
													return response;
												},
												error: pion.getXhrErrorHandler(dojo.xhrDelete)
											});
											page.device_list_initialized = true;
										}
									});
								},
								error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
							});
						}
					}
				});
			}
		},
		error: function(response, ioArgs) {
			pion.handleXhrGetError();

			// Can't be 401, because the only way to get here is from pion.checkKeyService()
			// and only if the KeyService response was not 401.
			/*
			if (ioArgs.xhr.status == 401) {
				if (!dojo.cookie('logged_in')) {
					location.replace('login.html'); // exit and go to main login page
				}
				pion.login.doLoginDialog({success_callback: pion.editionSetup});
			} else {
				console.error('HTTP status code: ', ioArgs.xhr.status);
			}
			return response;
			*/
		}
	});
}

pion.checkKeyService = function() {
	pion.about.checkKeyStatusDfd()
	.addCallback(function(license_key_type) {
		pion.editionSetup(license_key_type);
	})
	.addErrback(function(e) {
		if (e.message == 'Not logged in.') {
			if (!dojo.cookie("logged_in")) {
				location.replace('login.html'); // exit and go to main login page
			}
			pion.login.doLoginDialog({
				suppress_default_key_status_check: true,
				success_callback: pion.checkKeyService
			});
		} else {
			pion.handleXhrGetError();
		}
	});
}

var init = function() {
	file_protocol = (window.location.protocol == "file:");
	firefox_on_mac = navigator.userAgent.indexOf('Mac') >= 0 && navigator.userAgent.indexOf('Firefox') >= 0;

	pion.checkKeyService();

	/*
	// This block seems obsolete.
	if (!file_protocol) {
		// do a fetch just to check if the datastore is available
		pion.terms.store.fetch({onError: function(errorData, request){
			alert('dojo.data error: url = ' + request.store._url + '\nIs pion running?');
			console.debug('window.location.protocol = ', window.location.protocol);
		}});
	}
	*/
}

dojo.addOnLoad(init);

function configPageSelected(page) {
	console.debug('Selected ' + page.title + ' configuration page');
	pion.current_page = page.title;
	if (page.title == "Reactors") {
		if (reactor_config_page_initialized) {
			pion.reactors.reselectCurrentWorkspace(); // In case current workspace was created via another page.
			dijit.byId('main_stack_container').resize({h: pion.reactors.getHeight()});
		} else {
			pion.reactors.init();
			reactor_config_page_initialized = true;
		}
	} else if (page.title == "Vocabularies") {
		if (vocab_config_page_initialized) {
			dijit.byId('main_stack_container').resize({h: pion.vocabularies.getHeight()});
		} else {
			pion.vocabularies.init();
			vocab_config_page_initialized = true;
		}
	} else if (page.title == "Codecs") {
		if (codec_config_page_initialized) {
			pion.codecs._adjustAccordionSize(); // In case Codecs were added via another page.
			dijit.byId('main_stack_container').resize({h: pion.codecs.getHeight()});
		} else {
			pion.codecs.init();
			codec_config_page_initialized = true;
		}
	} else if (page.title == "Databases") {
		if (database_config_page_initialized) {
			pion.databases._adjustAccordionSize(); // In case Databases were added via another page.
			dijit.byId('main_stack_container').resize({h: pion.databases.getHeight()});
		} else {
			pion.databases.init();
			database_config_page_initialized = true;
		}
	} else if (page.title == "Protocols") {
		if (protocol_config_page_initialized) {
			pion.protocols._adjustAccordionSize(); // In case Protocols were added via another page.
			dijit.byId('main_stack_container').resize({h: pion.protocols.getHeight()});
		} else {
			pion.protocols.init();
			protocol_config_page_initialized = true;
		}
	} else if (page.title == "Users") {
		if (user_config_page_initialized) {
			dijit.byId('main_stack_container').resize({h: pion.users.getHeight()});
		} else {
			pion.users.init();
			user_config_page_initialized = true;
		}
	} else if (page.title == "System") {
		if (system_config_page_initialized) {
			dijit.byId('main_stack_container').resize({h: pion.system.getHeight()});
		} else {
			pion.system.init();
			system_config_page_initialized = true;
		}
	} else if (page.onSelect) {
		page.onSelect();
	}
}

// Override dijit.form.TextBox.prototype._setValueAttr(), because with the current version (1.2.1),
// dijit.form.FilteringSelect doesn't work right with dojox.data.XmlStore.
dijit.form.TextBox.prototype._setValueAttr = function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
	var filteredValue;
	if(value !== undefined){
		filteredValue = this.filter(value);
		if(filteredValue !== null && ((typeof filteredValue != "number") || !isNaN(filteredValue))){
			//if(typeof formattedValue != "string"){
			if(formattedValue === undefined || !formattedValue.toString){
				formattedValue = this.format(filteredValue, this.constraints);
			}
		}else{ formattedValue = ''; }
	}
	if(formattedValue != null && formattedValue != undefined){
		this.textbox.value = formattedValue;
	}
	dijit.form.TextBox.superclass._setValueAttr.call(this, filteredValue, priorityChange);
}

// Override dijit.Dialog.prototype._size().
dijit.Dialog.prototype._size = function() {
	// summary:
	// 		Make sure the dialog is small enough to fit in viewport.

	var mb = dojo.marginBox(this.domNode);
	var viewport = dijit.getViewport();
	if(mb.w >= viewport.w || mb.h >= viewport.h){
		dojo.style(this.containerNode, {
			// DON'T change the width!
			//width: Math.min(mb.w, Math.floor(viewport.w * 0.75))+"px",

			// Changed .75 to .90 to get more real estate.
			//height: Math.min(mb.h, Math.floor(viewport.h * 0.75))+"px",
			height: Math.min(mb.h, Math.floor(viewport.h * 0.90))+"px",

			overflow: "auto",
			position: "relative"	// workaround IE bug moving scrollbar or dragging dialog
		});
	}
}

// See http://trac.dojotoolkit.org/ticket/6759 (in particular, multipledialog.patch)
// for an explanation of the following overrides of dijit.Dialog and dijit.DialogUnderlay methods.
dijit.DialogUnderlay.prototype.postCreate = function() {
	// summary: Append the underlay to the body
	dojo.body().appendChild(this.domNode);
	this.bgIframe = new dijit.BackgroundIframe(this.domNode);
	this._modalConnect = null;
}

dijit.DialogUnderlay.prototype.hide = function() {
	// summary: hides the dialog underlay
	this.domNode.style.display = "none";
	if(this.bgIframe.iframe){
		this.bgIframe.iframe.style.display = "none";
	}
	dojo.disconnect(this._modalConnect);
	this._modalConnect = null;
}

dijit.DialogUnderlay.prototype._onMouseDown = function(/*Event*/ evt) {
	dojo.stopEvent(evt);
	window.focus();
}

dijit.Dialog.prototype.show = function() {
	// summary: display the dialog

	if(this.open){ return; }
	
	// first time we show the dialog, there's some initialization stuff to do			
	if(!this._alreadyInitialized){
		this._setup();
		this._alreadyInitialized=true;
	}

	if(this._fadeOut.status() == "playing"){
		this._fadeOut.stop();
	}

	this._modalconnects.push(dojo.connect(window, "onscroll", this, "layout"));
	this._modalconnects.push(dojo.connect(window, "onresize", this, "layout"));
	//this._modalconnects.push(dojo.connect(dojo.doc.documentElement, "onkeypress", this, "_onKey"));
	this._modalconnects.push(dojo.connect(this.domNode, "onkeypress", this, "_onKey"));

	dojo.style(this.domNode, {
		opacity:0,
		visibility:""
	});
	
	this.open = true;
	this._loadCheck(); // lazy load trigger

	this._size();
	this._position();

	this._fadeIn.play();

	this._savedFocus = dijit.getFocus(this);

	if(this.autofocus){
		// find focusable Items each time dialog is shown since if dialog contains a widget the 
		// first focusable items can change
		this._getFocusItems(this.domNode);

		// set timeout to allow the browser to render dialog
		setTimeout(dojo.hitch(dijit,"focus",this._firstFocusItem), 50);
	}
}
