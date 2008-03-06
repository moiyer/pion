dojo.provide("pion.reactors");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.dnd.move");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.Menu");
dojo.require("dojox.data.XmlStore");
dojo.require("dojox.gfx");
dojo.require("dojox.grid.Grid");

// configuration parameters
var STEP = 10;
var minimum_workspace_width = 2000;
var minimum_workspace_height = 2000;

var latest_event = null;
var workspace_boxes = [];
var workspace_box = null;
var surface = null;
var new_workspace_tab_clicked = false;
var workspaces_by_name = {};
var reactors_by_id = {};
var reactor_config_store;
var filter_reactor_grid_model = new dojox.grid.data.Table(null, []);
var reactor_inputs_grid_model = new dojox.grid.data.Table(null, []);
var reactor_outputs_grid_model = new dojox.grid.data.Table(null, []);

pion.reactors.config_store = null;

pion.reactors.comparison_type_store = new dojo.data.ItemFileReadStore({url: 'comparisonTypes.json'});

pion.reactors.getHeight = function() {
	// TODO: replace 150 with some computed value
	return dojo.byId('outer').clientHeight - 150;
}

pion.reactors.init = function() {
	dijit.byId('main_stack_container').resize({h: pion.reactors.getHeight()});

	var ops_toggle_button = dijit.byId('ops_toggle_button');
	dojo.connect(ops_toggle_button.domNode, 'click', function() {
		if (ops_toggle_button.checked) {
			dojo.addClass(dojo.byId('counterBackground'), 'hidden');
		} else {
			dojo.removeClass(dojo.byId('counterBackground'), 'hidden');
		}
	});

	pion.reactors.plugin_data_store = new dojo.data.ItemFileReadStore({url: 'plugins/reactors.json'});

	pion.reactors.plugin_data_store.fetch({
		onItem: function(item) {
			reactor_package = "plugins.reactors." + pion.reactors.plugin_data_store.getValue(item, 'plugin');
			dojo.require(reactor_package);

			// TODO: add reactor icon to sidebar
		}
	});

	// Assign an id for the 'add new workspace' tab (at this point the only tab), so it can get special styling.
	dojo.query(".dijitTab")[0].id = 'create_new_workspace_tab';

	if (file_protocol) {
		addWorkspace();
		workspace_box = workspace_boxes[0];
		surface = workspace_box.my_surface;
		dijit.byId("mainTabContainer").selectChild(workspace_box.my_content_pane);
	} else {
		reactor_config_store = new dojox.data.XmlStore({url: '/config/reactors'});
		pion.reactors.config_store = reactor_config_store;
		reactor_config_store.fetch({
			query: {tagName: 'Reactor'},
			onItem: function(item, request) {
				console.debug('fetched Reactor with id = ', reactor_config_store.getValue(item, '@id'));

				var config = {};
				var attributes = reactor_config_store.getAttributes(item);
				for (var i = 0; i < attributes.length; ++i) {
					if (attributes[i] != 'tagName' && attributes[i] != 'childNodes') {
						config[attributes[i]] = reactor_config_store.getValue(item, attributes[i]).toString();
					}
				}
				console.dir(config);

				workspace_box = workspaces_by_name[config.Workspace];
				if (!workspace_box) {
					addWorkspace(config.Workspace);
				}
				dijit.byId("mainTabContainer").selectChild(workspace_box.my_content_pane);

				var reactor_node = document.createElement("div");
				workspace_box.node.appendChild(reactor_node);
				var reactor = createReactor(config, reactor_node);
				reactors_by_id[config.@id] = reactor;
				reactor.item = item;
				reactor.workspace = workspace_box;
				workspace_box.reactors.push(reactor);
				console.debug('X, Y = ', config.X, ', ', config.Y);
			},
			onComplete: function(items, request) {
				console.debug('done fetching Reactors');
				reactor_config_store.fetch({
					query: {tagName: 'Connection'},
					onItem: function(item, request) {
						var startNode_id  = reactor_config_store.getValue(item, 'From').toString();
						var endNode_id    = reactor_config_store.getValue(item, 'To').toString();
						var connection_id = reactor_config_store.getValue(item, '@id').toString();
						console.debug('fetched Connection from ', startNode_id, ' to ', endNode_id, ', with ID = ', connection_id);

						var start_reactor = reactors_by_id[startNode_id];
						var end_reactor   = reactors_by_id[endNode_id];
						workspace_box = start_reactor.workspace;
						surface = workspace_box.my_surface;
						dijit.byId("mainTabContainer").selectChild(workspace_box.my_content_pane);
						var line = surface.createPolyline().setStroke("black");
						updateConnectionLine(line, start_reactor.domNode, end_reactor.domNode);

						start_reactor.reactor_outputs.push({sink: end_reactor, line: line, id: connection_id});
						end_reactor.reactor_inputs.push({source: start_reactor, line: line, id: connection_id});
					},
					onComplete: function(items, request) {
						console.debug('done fetching Connections');
						if (workspace_boxes.length == 0) {
							addWorkspace();
						}
						workspace_box = workspace_boxes[0];
						surface = workspace_box.my_surface;
						dijit.byId("mainTabContainer").selectChild(workspace_box.my_content_pane);
					}
				});
			}
		});
	}

	dojo.connect(window, 'onresize', expandWorkspaceIfNeeded);
	dojo.connect(document, 'onkeypress', handleKeyPress);

	// This is a workaround for something that may or may not be a bug in dojo, but is definitely not the behavior
	// we want.  The problem is that the tab that's clicked will always look as if it's selected, even if clicking it
	// triggers another tab to actually be selected.

	// This is a workaround for a bug in dojo, namely that the tab that's clicked will always look as if it's selected, 
	// even if clicking it triggered another tab to actually be selected, as is the case with the 'add new workspace' tab.
	dojo.connect(dijit.byId("mainTabContainer").tablist, 'onButtonClick', 
					function() {
						if (new_workspace_tab_clicked) {
							var current_content_pane = workspace_box.my_content_pane;

							// Although current_content_pane is already selected, we need to reselect it to get the
							// tab itself to look selected.  But we can't just call selectChild, because it won't do
							// anything since it's already selected.  So, we need to select a different pane first.
							// workspace_boxes[0] is NOT the current content pane, since it can't be a new workspace.
							dijit.byId("mainTabContainer").selectChild(workspace_boxes[0].my_content_pane);
							
							// Now we can reselect, and finally the tab will show that it's selected.
							dijit.byId("mainTabContainer").selectChild(current_content_pane);

							// Reset this since the workaround is only needed when the 'add new workspace' tab is clicked. 
							new_workspace_tab_clicked = false;
						}
					});

	if (!file_protocol) {
		var prev_global_ops = 0;
		var prev_events_in_for_workspace = 0;
		setInterval(function() {
			if (!ops_toggle_button.checked) {
				dojo.xhrGet({
					url: '/config/reactors/stats',
					handleAs: 'xml',
					timeout: 1000,
					load: function(response, ioArgs) {
						var node = response.getElementsByTagName('TotalOps')[0];
						var global_ops = parseInt(dojo.isIE? node.xml : node.textContent);
						dojo.byId('global_ops').innerHTML = global_ops - prev_global_ops;
						prev_global_ops = global_ops;
						var events_in_for_workspace = 0;
						var reactors = response.getElementsByTagName('Reactor');
						dojo.forEach(reactors, function(n) {
							var id = n.getAttribute('id');
							var reactor = reactors_by_id[id];
							if (reactor.workspace == workspace_box) {
								var events_in_node = n.getElementsByTagName('EventsIn')[0];
								var events_in = parseInt(dojo.isIE? events_in_node.xml : events_in_node.textContent);
								reactor.ops_per_sec.innerHTML = events_in - reactor.prev_events_in;
								reactor.prev_events_in = events_in;
								events_in_for_workspace += events_in;
							}
						});
						dojo.byId('workspace_ops').innerHTML = events_in_for_workspace - prev_events_in_for_workspace;
						prev_events_in_for_workspace = events_in_for_workspace;
						return response;
					},
					error: function(response, ioArgs) {
						console.error('HTTP status code: ', ioArgs.xhr.status);
						return response;
					}
				});
			}
		}, 1000);
	}
}

function addWorkspace(name) {
	var i = workspace_boxes.length;
	if (name) {
		var title = name;
	} else {
		var title = 'Workspace ' + (i + 1);
		for (var j = i + 2; isDuplicateWorkspaceName(null, title); ++j) {
			title = 'Workspace ' + j;
		};
	}
	var workspace_pane = new dijit.layout.ContentPane({ "class": "workspacePane", title: title, style: "overflow: auto" });
	var tab_container = dijit.byId("mainTabContainer");
	var margin_box = dojo.marginBox(tab_container.domNode);
	console.debug('margin_box = dojo.marginBox(tab_container.domNode) = ', margin_box);
	var shim = document.createElement("div");
	if (margin_box.w < minimum_workspace_width) {
		shim.style.width = minimum_workspace_width + "px";
	} else {
		// keeps scroll bars from appearing unnecessarily in IE and Firefox on Mac OS X
		shim.style.width = (margin_box.w - 4) + "px";
	}
	if (margin_box.h < minimum_workspace_height) {
		shim.style.height = minimum_workspace_height + "px";
	}
	workspace_pane.domNode.appendChild(shim);
	tab_container.addChild(workspace_pane, i);
	var new_workspace = new dojo.dnd.Target(shim, { accept: ["reactor"] });
	dojo.addClass(new_workspace.node, "workspaceTarget");
	dojo.connect(new_workspace, "onDndDrop", function(source, nodes, copy, target){ handleDropOnWorkspace(source, nodes, copy, new_workspace); });
	dojo.connect(new_workspace.node, "onmouseup", updateLatestMouseUpEvent);
	new_workspace.my_content_pane = workspace_pane;
	workspace_pane.my_workspace_box = new_workspace;
	workspaces_by_name[title] = new_workspace;
	workspace_boxes[i] = new_workspace;

	// Need to do this now so that the dimensions of new_workspace are calculated.
	tab_container.selectChild(workspace_pane);

	new_workspace.node.style.width = new_workspace.node.offsetWidth + "px"; // This will keep it from automatically changing on resize.
	var surface_box = dojo.marginBox(new_workspace.node);
	surface_box.h -= 6; // We need some decrement even when there's no horizontal scroll bar, to avoid a vertical scroll bar.
						// This is enough for Firefox on both Windows XP and Mac OS X, and for IE.
	/*
	surface_box.h -= 20; // If there's a horiz scroll bar, we need to additionally decrement by its height to avoid a vertical scroll bar.
						 // TODO: figure out whether there's a scroll bar, and if so get its height h and decrement by h, else no (add'l) decrement. 
	*/
	console.debug('surface_box = ', surface_box);
	new_workspace.my_surface = dojox.gfx.createSurface(new_workspace.node, surface_box.w, surface_box.h);

	// Need to select the pane again, to incorporate the surface.
	tab_container.selectChild(workspace_pane);

	new_workspace.reactors = [];
	new_workspace.isTracking = false;

	// Add a context menu, for both the workspace content pane and the tab button.
	if (!firefox_on_mac) {
		var menu = new dijit.Menu({targetNodeIds: [workspace_pane.controlButton.domNode, new_workspace.node]});
		menu.addChild(new dijit.MenuItem({ label: "Edit workspace configuration", onClick: function(){showWorkspaceConfigDialog(workspace_pane);} }));
		menu.addChild(new dijit.MenuItem({ label: "Delete workspace", onClick: function(){deleteWorkspaceIfConfirmed(workspace_pane);} }));
	}
	
	new_workspace.node.ondblclick = function(){showWorkspaceConfigDialog(workspace_pane);}
	workspace_pane.controlButton.domNode.ondblclick = function(){showWorkspaceConfigDialog(workspace_pane);}
/*
This scroll handling is kind of buggy, and not a high priority feature, so disable it for now.

	// Handle scroll events so that scrolling always occurs in multiples of STEP pixels.
	workspace_pane.isScrolling = false;
	workspace_pane.prevScrollTop = 0;
	workspace_pane.prevScrollLeft = 0;
	dojo.connect(workspace_pane.domNode, "scroll", makeScrollHandler(workspace_pane));
*/
}

// Return a scroll event handler for a specific workspace pane.  The handler waits until all pending
// scroll events are handled by the browser, then quantizes the scroll values.
function makeScrollHandler(workspace_pane) {
	var _pane = workspace_pane;
	var _node = workspace_pane.domNode;
	return function() {
		if (_pane.isScrolling) return;
		_pane.isScrolling = true;
		var callback = function() {
			_pane.isScrolling = false;

			// Round scroll positions to the nearest multiple of STEP in the direction of scrolling.
			if (_node.scrollLeft > _pane.prevScrollLeft) {
				_node.scrollLeft += STEP - _node.scrollLeft % STEP;
			} else {
				_node.scrollLeft -= _node.scrollLeft % STEP;
			}
			if (_pane.prevScrollTop > _node.scrollTop) {
				_node.scrollTop += STEP - _node.scrollTop % STEP;
			} else if (_node.scrollTop <= STEP) {
				_node.scrollTop = 0; // For some reason, the vertical scroll sometimes gets stuck just below the top.
			} else {
				_node.scrollTop -= _node.scrollTop % STEP;
			}

			// Save the scroll positions so that the direction of scrolling can be determined.
			_pane.prevScrollLeft = _node.scrollLeft;
			_pane.prevScrollTop  = _node.scrollTop;
		};

		// We're calling setTimeout with a value of 0, so that the callback will be called
		// as soon as all pending events are handled.  This avoids the problem that with IE,
		// even a minimal scroll sets off a bunch of onscroll events, often with just one
		// pixel difference between them.  (Note: this is not for efficiency reasons, it's
		// to make the quantization work in a reasonable way.)
		setTimeout(callback, 0);
	};
}

function updateLatestMouseUpEvent(e) {
	latest_event = e;
	console.debug("e = ", e);
	pion.reactors.last_x = e.clientX;
	pion.reactors.last_y = e.clientY;
}

function getNearbyGridPointInBox(constraintBox, currentLeftTop) {
	//console.debug("In getNearbyGridPointInBox, constraintBox: ", constraintBox);
	var c = constraintBox;
	//console.debug("constraintBox: ", constraintBox);
	c.l += STEP - 1; c.l -= c.l % STEP;
	c.t += STEP - 1; c.t -= c.t % STEP;
	//console.debug("constraintBox: ", constraintBox);
	var newLeftTop = {};
	newLeftTop.l = currentLeftTop.l < c.l ? c.l : c.r < currentLeftTop.l ? c.r : currentLeftTop.l;
	newLeftTop.t = currentLeftTop.t < c.t ? c.t : c.b < currentLeftTop.t ? c.b : currentLeftTop.t;
	newLeftTop.l -= newLeftTop.l % STEP;
	newLeftTop.t -= newLeftTop.t % STEP;
	//console.debug("currentLeftTop: ", currentLeftTop);
	//console.debug("newLeftTop: ", newLeftTop);

	return newLeftTop;
}

function updateConnectionLine(poly, start_node, end_node) {
	// poly: the polyline to update
	// start_node: the node representing the reactor box at the start of the connection
	// end_node: the node representing the reactor box at the end of the connection

	// set (x1, y1) to the center of start_node
	var x1 = start_node.offsetLeft + start_node.offsetWidth / 2;
	var y1 = start_node.offsetTop + start_node.offsetHeight / 2;

	if (end_node.offsetTop > y1) {									// horiz line y = y1 passes above end_node
		var x2 = end_node.offsetLeft + end_node.offsetWidth / 2;
		var y2 = end_node.offsetTop;
		// add down arrow
		var a1 = {x: x2 - 5, y: y2 - 5};
		var a2 = {x: x2 + 5, y: y2 - 5};
	} else if (end_node.offsetTop + end_node.offsetHeight < y1) {	// horiz line y = y1 passes below end_node
		var x2 = end_node.offsetLeft + end_node.offsetWidth / 2;
		var y2 = end_node.offsetTop + end_node.offsetHeight;
		// add up arrow
		var a1 = {x: x2 - 5, y: y2 + 5};
		var a2 = {x: x2 + 5, y: y2 + 5};
	} else if (end_node.offsetLeft > x1) {							// horiz line y = y1 intersects end_node from the left
		var x2 = end_node.offsetLeft;
		var y2 = y1;
		// add right arrow
		var a1 = {x: x2 - 5, y: y2 - 5};
		var a2 = {x: x2 - 5, y: y2 + 5};
	} else {														// horiz line y = y1 intersects end_node from the right
		var x2 = end_node.offsetLeft + end_node.offsetWidth;
		var y2 = y1;
		// add left arrow
		var a1 = {x: x2 + 5, y: y2 - 5};
		var a2 = {x: x2 + 5, y: y2 + 5};
	}
	//console.debug("x1 = ", x1, ", y1 = ", y1, ', x2 = ', x2, ', y2 = ', y2);
	poly.setShape([{x: x1, y: y1}, {x: x2, y: y1}, {x: x2, y: y2}, a1, {x: x2, y: y2}, a2]).setStroke("black");
}

function createReactor(config, node) {
	plugin_class_name = "plugins.reactors." + config.Plugin;
	var plugin_class = dojo.getObject(plugin_class_name);
	if (plugin_class) {
		console.debug('found class ', plugin_class_name);
		var reactor = new plugin_class({config: config}, node);
	} else {
		console.debug('class ', plugin_class_name, ' not found; using plugins.reactors.Reactor instead.');
		var reactor = new plugins.reactors.Reactor({config: config}, node);
	}
	return reactor;
}

function handleDropOnWorkspace(source, nodes, copy, target) {
	console.debug("handleDropOnWorkspace called, target.node = ", target.node, ", workspace_box.node = ", workspace_box.node);
	if (target != workspace_box) {
		// So why was handleDropOnWorkspace called?  Because the manager is using a global canDrop flag.
		// I added 
		//		if(this.targetState == "Disabled"){ break; }
		// to onDndDrop(), but that's too late to prevent handleDropOnWorkspace from getting called.
		//alert("huh?");
		return;
	}
	//console.debug("nodes[0]: ", nodes[0]);
	//console.debug("nodes[0].getAttribute('dndType'): ", nodes[0].getAttribute('dndType'));
	if (nodes[0].getAttribute("dndType") != "reactor") {
		// This should not be reached, since the workspace targets are only supposed to accept reactors, but it is.
		console.debug("dropped object is not a reactor");
		return;
	}
	//debugger;
	console.debug(copy ? "Copying from" : "Moving from", source);
	console.debug("nodes: ", nodes);

	var reactor_type = nodes[0].getAttribute("reactor_type");
	var name = reactor_type + '_1';
	for (var i = 2; isDuplicateName('nothing', name); ++i) {
		name = reactor_type + "_" + i;
	}

	var dialog_class_name = 'plugins.reactors.' + reactor_type + 'InitDialog';
	var dialog_class = dojo.getObject(dialog_class_name);
	if (dialog_class) {
		var dialog = new dialog_class();
	} else {
		var dialog = new plugins.reactors.ReactorInitDialog({title: reactor_type + ' Initialization'});
	}

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dojo.query(".dijitButton.cancel", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', dialog, 'onCancel')
	});
	dialog.show();
	dialog.execute = function(dialogFields) {
		console.debug(dialogFields);
		var dc = dojo.coords(workspace_box.node);
		var X = pion.reactors.last_x - dc.x;
		var Y = pion.reactors.last_y - dc.y;
		var post_data = '<PionConfig><Reactor><Plugin>' + reactor_type 
					  + '</Plugin><Workspace>' + workspace_box.my_content_pane.title 
					  + '</Workspace><X>' + X + '</X><Y>' + Y + '</Y>';
		for (var tag in dialogFields) {
			console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
			post_data += '<' + tag + '>' + dialogFields[tag] + '</' + tag + '>';
		}
		post_data += '</Reactor></PionConfig>';
		console.debug('post_data: ', post_data);
		
		dojo.rawXhrPost({
			url: '/config/reactors',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response){
				var node = response.getElementsByTagName('Reactor')[0];
				var config = { '@id': node.getAttribute('id') };
				var attribute_nodes = node.childNodes;
				//console.debug('attribute_nodes: ', attribute_nodes);
				//console.dir(attribute_nodes);
				for (var i = 0; i < attribute_nodes.length; ++i) {
					if (attribute_nodes[i].firstChild) {
						config[attribute_nodes[i].tagName] = attribute_nodes[i].firstChild.nodeValue;
					}
				}
				//console.debug('config (from server): ', config);
				//console.dir(config);
				var reactor_node = document.createElement("div");
				workspace_box.node.replaceChild(reactor_node, workspace_box.node.lastChild);
				var reactor = createReactor(config, reactor_node);
				//console.debug('config.@id: ', config.@id);
				reactors_by_id[config.@id] = reactor;
				reactor.workspace = workspace_box;
				workspace_box.reactors.push(reactor);
			},
			error: function(response, ioArgs) {
				console.error('Error from rawXhrPost to /config/reactors.  HTTP status code: ', ioArgs.xhr.status);
				return response;
			}
		});
	}
}

function handleDropOnReactor(source, nodes, copy, target) {
	console.debug('handleDropOnReactor called, target.node.getAttribute("reactor_type") = ', target.node.getAttribute("reactor_type"));
	//console.debug("target.targetState = ", target.targetState, ", isTracking = ", workspace_box.isTracking, ', target.node.lastChild = ', target.node.lastChild);

	// If target is not a reactor, return.  This happens when dropping reactors on the workspace, and seems to be a dnd bug. 
	if (!target.node.hasAttribute('reactor_type')) return;
	
	// handleDropOnReactor will be called more than once for a single drop.  One of these times will be just
	// after a connector node was added to the reactor.  If this is that time, delete the connector node.
	// Note that this sometimes happens after tracking has started, i.e. when isTracking == true.
	dojo.query('.dojoDndItem', target.node).forEach(function(n) {
		target.node.removeChild(n);
	});

	// If we're already tracking a connector for this target, we're done.
	if (workspace_box.isTracking) return;

	//debugger;
	console.debug('nodes[0].getAttribute("dndType") = ', nodes[0].getAttribute("dndType"));
	console.debug('nodes[0].getAttribute("reactor_type") = ', nodes[0].getAttribute("reactor_type"));

	if (nodes[0].getAttribute("dndType") != "connector") {
		// This should not be reached, since reactor targets are only supposed to accept connectors.
		console.debug('returning because nodes[0].getAttribute("dndType") != "connector"');
		return;
	}

	workspace_box.isTracking = true;
	var x1 = target.node.offsetLeft + target.node.offsetWidth;
	var y1 = target.node.offsetTop  + target.node.offsetHeight / 2;
	console.debug("x1 = ", x1, ", y1 = ", y1);
	workspace_box.trackLine = surface.createPolyline([{x: x1, y: y1}, {x: x1 + 20, y: y1}, {x: x1 + 15, y: y1 - 5}, {x: x1 + 20, y: y1}, {x: x1 + 15, y: y1 + 5}]).setStroke("black");
	var xOffset = dojo.byId("reactor_config_content").offsetLeft;
	var yOffset = dojo.byId("reactor_config_content").offsetTop;
	yOffset += dojo.byId("reactor_config").offsetTop;
	console.debug("xOffset = ", xOffset, ", yOffset = ", yOffset);
	mouseConnection = dojo.connect(workspace_box.node, 'onmousemove', 
		function(event) {
			var x2 = event.clientX - xOffset;
			var y2 = event.clientY - yOffset;
			workspace_box.trackLine.setShape([{x: x1, y: y1}, {x: x2, y: y1}, {x: x2, y: y2}])
		});
	console.debug("created mouseConnection");

	// the startpoint of the connection will be the widget at target.node, i.e. the reactor the connector was dropped on
	wrapperWithStartpoint = function(event) {
		dojo.disconnect(mouseConnection);
		console.debug("disconnected mouseConnection");
		workspace_box.trackLine.removeShape();
		handleSelectionOfConnectorEndpoint(event, target.node);
	}

	dojo.query(".moveable").filter(function(n) { return n != target.node; }).forEach("item.onClickHandler = dojo.connect(item, 'click', wrapperWithStartpoint)");

	// TODO: disable everything except clicking on moveable's.
}

function handleSelectionOfConnectorEndpoint(event, source_target) {
	workspace_box.isTracking = false;
	console.debug('handleSelectionOfConnectorEndpoint: event = ', event);
	var source_reactor = dijit.byNode(source_target);
	console.debug('source_reactor = ', source_reactor);
	var sink_reactor = dijit.byNode(event.target);
	if (!sink_reactor) {
		// This will happen, e.g., when clicking on the name div of the reactor.
		sink_reactor = dijit.byNode(event.target.parentNode);
	}
	console.debug('sink_reactor = ', sink_reactor);

	// Disconnect the click handlers on all moveable's.
	dojo.query(".moveable").forEach("dojo.disconnect(item.onClickHandler)");

	var post_data = '<PionConfig><Connection><Type>reactor</Type>'
				  + '<From>' + source_reactor.config.@id + '</From>'
				  + '<To>' + sink_reactor.config.@id + '</To>'
				  + '</Connection></PionConfig>';
	dojo.rawXhrPost({
		url: '/config/connections',
		contentType: "text/xml",
		handleAs: "xml",
		postData: post_data,
		load: function(response){
			var node = response.getElementsByTagName('Connection')[0];
			var id = node.getAttribute('id');
			console.debug('connection id (from server): ', id);

			var line = surface.createPolyline().setStroke("black");
			updateConnectionLine(line, source_reactor.domNode, sink_reactor.domNode);

			source_reactor.reactor_outputs.push({sink: sink_reactor, line: line, id: id});
			sink_reactor.reactor_inputs.push({source: source_reactor, line: line, id: id});
		},
		error: function(response, ioArgs) {
			console.error('Error from rawXhrPost to /config/connections.  HTTP status code: ', ioArgs.xhr.status);
			return response;
		}
	});
}

// Returns true if there is another reactor with the given name.
// TODO: Should we check all the workspaces here instead of just the current one?
function isDuplicateName(reactor, name) {
	for (var i = 0; i < workspace_box.reactors.length; ++i) {
		console.debug('name = ', name, ', workspace_box.reactors[i].name = ', workspace_box.reactors[i].name);
		if (workspace_box.reactors[i] != reactor && workspace_box.reactors[i].name == name) {
			return true;
		}
	}
	return false;
}

function showReactorConfigDialog(reactor) {
	var dialog_class_name = 'plugins.reactors.' + reactor.config.Plugin + 'Dialog';
	console.debug('dialog_class_name = ', dialog_class_name);
	var dialog_class = dojo.getObject(dialog_class_name);
	if (dialog_class) {
		var dialog = new dialog_class({reactor: reactor});
	} else {
		var dialog = new plugins.reactors.ReactorDialog({title: reactor.config.Plugin + ' Configuration', reactor: reactor});
	}
	console.debug('reactor.config.@id: ', reactor.config.@id);
	dialog.setValues(reactor.config);

	var reactor_inputs_table = [];
	for (var i = 0; i < reactor.reactor_inputs.length; ++i) {
		var reactor_inputs_table_row = [];
		reactor_inputs_table_row[0] = reactor.reactor_inputs[i].source.config.Name;
		reactor_inputs_table_row[1] = reactor.reactor_inputs[i].id;
		reactor_inputs_table.push(reactor_inputs_table_row);
	}
	reactor_inputs_grid_model.setData(reactor_inputs_table);
	var reactor_inputs_grid = dialog.reactor_inputs_grid;
	setTimeout(function(){
		reactor_inputs_grid.update();
		reactor_inputs_grid.resize();
	}, 200);
	dojo.connect(reactor_inputs_grid, 'onCellClick', function(e) {
		console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
		if (e.cellIndex == 2) {
			console.debug('Removing connection in row ', e.rowIndex); 
			var reactor_input = reactor.reactor_inputs[e.rowIndex];
			dojo.xhrDelete({
				url: '/config/connections/' + reactor_input.id,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					console.debug('xhrDelete for url = /config/connections/', reactor_input.id, '; HTTP status code: ', ioArgs.xhr.status);
					reactor_inputs_grid.removeSelectedRows();

					var incoming_reactor = reactor_input.source;
					reactor_input.line.removeShape();
					reactor.reactor_inputs.splice(e.rowIndex, 1);

					// remove reactor from the outputs of incoming_reactor
					for (var j = 0; j < incoming_reactor.reactor_outputs.length; ++j) {
						if (incoming_reactor.reactor_outputs[j].sink == reactor) {
							incoming_reactor.reactor_outputs.splice(j, 1);
							break;
						}
					}
					return response;
				},
				error: function(response, ioArgs) {
					console.error('HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		}
	});

	var reactor_outputs_table = [];
	for (var i = 0; i < reactor.reactor_outputs.length; ++i) {
		var reactor_outputs_table_row = [];
		reactor_outputs_table_row[0] = reactor.reactor_outputs[i].sink.config.Name;
		reactor_outputs_table_row[1] = reactor.reactor_outputs[i].id;
		reactor_outputs_table.push(reactor_outputs_table_row);
	}
	reactor_outputs_grid_model.setData(reactor_outputs_table);
	var reactor_outputs_grid = dialog.reactor_outputs_grid;
	setTimeout(function(){
		reactor_outputs_grid.update();
		reactor_outputs_grid.resize();
	}, 200);
	dojo.connect(reactor_outputs_grid, 'onCellClick', function(e) {
		console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
		if (e.cellIndex == 2) {
			console.debug('Removing connection in row ', e.rowIndex); 
			var reactor_output = reactor.reactor_outputs[e.rowIndex];
			dojo.xhrDelete({
				url: '/config/connections/' + reactor_output.id,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					console.debug('xhrDelete for url = /config/connections/', reactor_output.id, '; HTTP status code: ', ioArgs.xhr.status);
					reactor_outputs_grid.removeSelectedRows();

					var outgoing_reactor = reactor_output.sink;
					reactor_output.line.removeShape();
					reactor.reactor_outputs.splice(e.rowIndex, 1);

					// remove reactor from the inputs of outgoing_reactor
					for (var j = 0; j < outgoing_reactor.reactor_inputs.length; ++j) {
						if (outgoing_reactor.reactor_inputs[j].source == reactor) {
							outgoing_reactor.reactor_inputs.splice(j, 1);
							break;
						}
					}
					return response;
				},
				error: function(response, ioArgs) {
					console.error('HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		}
	});

	// The following use forEach to allow either zero or multiple matches.
	dojo.query(".dijitComboBox[name='event_type']", dialog.domNode).forEach(function(n) {
		dijit.byNode(n).setValue(reactor.event_type || 1);  // '1' means the item in the event data store with term_ref = 1
	});
	dojo.query(".dijitButton.delete", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() { dialog.onCancel(); deleteReactorIfConfirmed(reactor); })
	});
	dojo.query(".dijitButton.cancel", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', dialog, 'onCancel')
	});
	dojo.query(".dijitButton.save", dialog.domNode).forEach(function(n) {
		dijit.byNode(n).onClick = function() { return dialog.isValid(); };
	});

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dialog.show();
}

function deleteReactorIfConfirmed(reactor) {
	var dialog = dijit.byId('delete_confirmation_dialog');
	dojo.byId("are_you_sure").innerHTML = "Are you sure you want to delete this reactor?";
	dojo.byId('confirm_delete').onclick = function() { dialog.onCancel(); deleteReactor(reactor); };
	dojo.byId('cancel_delete').onclick = function() { dialog.onCancel(); };
	dialog.show();
	setTimeout("dijit.byId('cancel_delete').focus()", 500);
}

function deleteReactor(reactor) {
	console.debug('deleting ', reactor.config.Name);

	dojo.xhrDelete({
		url: '/config/reactors/' + reactor.config.@id,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			console.debug('xhrDelete for url = /config/reactors/', reactor.config.@id, '; HTTP status code: ', ioArgs.xhr.status);

			// Remove the reactor from the outputs of incoming reactors and the inputs of
			// incoming reactors, and remove the lines connecting them.
			for (var i = 0; i < reactor.reactor_inputs.length; ++i) {
				var incoming_reactor = reactor.reactor_inputs[i].source;
				reactor.reactor_inputs[i].line.removeShape();
				
				// remove reactor from the outputs of incoming_reactor
				for (var j = 0; j < incoming_reactor.reactor_outputs.length; ++j) {
					if (incoming_reactor.reactor_outputs[j] == reactor) {
						incoming_reactor.reactor_outputs.splice(j, 1);
					}
				}
			}
			for (var i = 0; i < reactor.reactor_outputs.length; ++i) {
				var outgoing_reactor = reactor.reactor_outputs[i].sink;
				reactor.reactor_outputs[i].line.removeShape();

				// remove reactor from the inputs of outgoing_reactor
				for (var j = 0; j < outgoing_reactor.reactor_inputs.length; ++j) {
					if (outgoing_reactor.reactor_inputs[j] == reactor) {
						outgoing_reactor.reactor_inputs.splice(j, 1);
					}
				}
			}

			// Remove the reactor's node from the DOM tree, and finally, remove the reactor
			// itself from the list of reactors.
			workspace_box.node.removeChild(reactor.domNode);
			for (var j = 0; j < workspace_box.reactors.length; ++j) {
				if (workspace_box.reactors[j] == reactor) {
					workspace_box.reactors.splice(j, 1);
				}
			}

			return response;
		},
		error: function(response, ioArgs) {
			console.error('HTTP status code: ', ioArgs.xhr.status);
			return response;
		}
	});	
}

dojo.subscribe("mainTabContainer-selectChild", selected);

function selected(page) {
	if (page.title == "Add new workspace") {
		console.debug("'Add new workspace' tab was selected");
		if (new_workspace_tab_clicked) {
			console.debug('redundant call');
			return;
		}
		new_workspace_tab_clicked = true;
		addWorkspace();
		return;
	}
	console.debug("selected " + page.title + ", page.id = " + page.id);
	workspace_box = page.my_workspace_box;
	surface = workspace_box.my_surface;

	// in case the window was resized since the workspace was last selected
	expandWorkspaceIfNeeded();
}

function expandWorkspaceIfNeeded() {
	if (!surface) return; // the workspace isn't ready yet

	//console.debug('workspace_box.node.offsetWidth = ', workspace_box.node.offsetWidth);
	//console.debug('workspace_box.node.offsetHeight = ', workspace_box.node.offsetHeight);

	// If the window was resized, the dimensions of the workspace's contentPane probably changed.
	// new_width and new_height are the new width and height of the viewing area.
	var new_width = workspace_box.my_content_pane.domNode.offsetWidth;
	var new_height = workspace_box.my_content_pane.domNode.offsetHeight;

	// keeps scroll bars from appearing unnecessarily in IE
	new_width -= 2;
	
	new_height -= 6; // We need some decrement even when there's no horizontal scroll bar, to avoid a vertical scroll bar.
					 // This is enough for Firefox on both Windows XP and Mac OS X, and for IE.

	// We can get the current workspace size from the surface.  (We can't use workspace_box.node.offsetWidth
	// and workspace_box.node.offsetHeight, because in certain situations they will have already been updated, 
	// namely, if the original width or height was > minimum and this is the first resize.)
	var surface_dims = surface.getDimensions();
	var old_width = parseInt(surface_dims.width);
	var old_height = parseInt(surface_dims.height);
	console.debug('old_width = ', old_width, ', new_width = ', new_width, ', old_height = ', old_height, ', new_height = ', new_height);

	// If the viewing area is larger than the workspace, expand the workspace to fill it.
	// We never decrease it; if the viewing area is smaller than the workspace, scroll bars will appear.
	if (new_width > old_width) {
		console.debug('expanding workspace width to ', new_width, "px");
		workspace_box.node.style.width = new_width + "px";
		surface_dims.width = new_width;
	}
	if (new_height > old_height) {
		console.debug('expanding workspace height to ', new_height, "px");
		workspace_box.node.style.height = new_height + "px";
		surface_dims.height = new_height;
	}
	if (new_width > old_width || new_height > old_height) {
		surface.setDimensions(surface_dims.width + "px", surface_dims.height + "px");
	}
}

function handleKeyPress(e) {
	if (e.keyCode == dojo.keys.ESCAPE) {
		if (workspace_box.isTracking) {
			dojo.disconnect(mouseConnection);
			workspace_box.trackLine.removeShape();
			workspace_box.isTracking = false;
		}
	}
}

function showWorkspaceConfigDialog(workspace_pane) {
	console.debug('showWorkspaceConfigDialog: workspace_pane = ', workspace_pane);
	console.debug('workspace_pane.title = ', workspace_pane.title);

	var validationTextBox = dijit.byId("workspace_name");
	validationTextBox.isValid = function(isFocused) {
		if (!this.validator(this.textbox.value, this.constraints)) {
			this.invalidMessage = "Invalid Workspace name";
			console.debug('validationTextBox.isValid returned false');
			return false;
		}
		if (isDuplicateWorkspaceName(workspace_pane, this.textbox.value)) {
			this.invalidMessage = "A Workspace with this name already exists";
			console.debug('In validationTextBox.isValid, isDuplicateWorkspaceName returned true');
			return false;
		}
		console.debug('validationTextBox.isValid returned true');
		return true;
	};
	validationTextBox.setDisplayedValue(workspace_pane.title);
	
	var dialog = dijit.byId("workspace_dialog");
	dojo.query(".dijitButton.delete", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() { dialog.onCancel(); deleteWorkspaceIfConfirmed(workspace_pane); })
	});
	dojo.query(".dijitButton.cancel", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', dialog, 'onCancel')
	});
	dojo.query(".dijitButton.save", dialog.domNode).forEach(function(n) {
		dijit.byNode(n).onClick = function() { return dialog.isValid(); };
	});

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dialog.show();
	dialog.execute = function(dialogFields) { updateWorkspaceConfig(dialogFields, workspace_pane); }
}

function updateWorkspaceConfig(dialogFields, node) {
	node.title = dialogFields.name;
	dojo.byId(node.controlButton.id).innerHTML = dialogFields.name;
}

// Returns true if there is another workspace with the given name.
function isDuplicateWorkspaceName(workspace_pane, name) {
	for (var i = 0; i < workspace_boxes.length; ++i) {
		if (workspace_boxes[i].my_content_pane != workspace_pane && workspace_boxes[i].my_content_pane.title == name) {
			return true;
		}
	}
	return false;
}

function deleteWorkspaceIfConfirmed(workspace_pane) {
	var dialog = dijit.byId('delete_confirmation_dialog');
	dojo.byId("are_you_sure").innerHTML = "Are you sure you want to delete workspace '" + workspace_pane.title + "'?";
	dojo.byId('confirm_delete').onclick = function() { dialog.onCancel(); deleteWorkspace(workspace_pane); };
	dojo.byId('cancel_delete').onclick = function() { dialog.onCancel(); };
	dialog.show();
	setTimeout("dijit.byId('cancel_delete').focus()", 500);
}

function deleteWorkspace(workspace_pane) {
	console.debug('deleting ', workspace_pane.title);
	
	for (var j = 0; j < workspace_boxes.length; ++j) {
		if (workspace_boxes[j] == workspace_pane.my_workspace_box) {
			workspace_boxes.splice(j, 1);
		}
	}
	dijit.byId("mainTabContainer").removeChild(workspace_pane);
}
