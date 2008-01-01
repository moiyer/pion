// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2008 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Pion is free software: you can redistribute it and/or modify it under the
// terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option)
// any later version.
//
// Pion is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
// more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Pion.  If not, see <http://www.gnu.org/licenses/>.
//

#include <pion/platform/VocabularyConfig.hpp>
#include <boost/lexical_cast.hpp>
#include <libxml/tree.h>
#include <cstdlib>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of VocabularyConfig
const std::string			VocabularyConfig::DEFAULT_CONFIG_FILE = "vocabulary.xml";
const std::string			VocabularyConfig::VOCABULARY_ELEMENT_NAME = "vocabulary";
const std::string			VocabularyConfig::NAMESPACE_ELEMENT_NAME = "namespace";
const std::string			VocabularyConfig::TERM_ELEMENT_NAME = "term";
const std::string			VocabularyConfig::MEMBER_ELEMENT_NAME = "member";
const std::string			VocabularyConfig::TYPE_ELEMENT_NAME = "type";
const std::string			VocabularyConfig::COMMENT_ELEMENT_NAME = "comment";
const std::string			VocabularyConfig::ID_ATTRIBUTE_NAME = "id";
const std::string			VocabularyConfig::SIZE_ATTRIBUTE_NAME = "size";
	
		
// VocabularyConfig member functions

VocabularyConfig::VocabularyConfig(void)
	: ConfigManager(DEFAULT_CONFIG_FILE),
	m_logger(PION_GET_LOGGER("pion.platform.VocabularyConfig")),
	m_vocabulary_node(NULL)
{
}

void VocabularyConfig::openConfigFile(void)
{
	// just return if it's already open
	if (m_vocabulary_node != NULL)
		return;
	
	// open the config file (returns false if the file is new)
	if (openAndParseConfigFile()) {
		
		// find the root "vocabulary" element
		m_vocabulary_node = static_cast<xmlNodePtr>(findConfigNodeByName(VOCABULARY_ELEMENT_NAME,
																		 static_cast<xmlNodePtr>(m_config_root_ptr)->children));
		if (m_vocabulary_node == NULL)
			throw MissingVocabularyException(getConfigFile());

		// get the unique identifier for the Vocabulary
		xmlChar *xml_char_ptr = xmlGetProp(static_cast<xmlNodePtr>(m_vocabulary_node),
										   reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyVocabularyIdException(getConfigFile());
		}
		m_vocabulary_id = reinterpret_cast<char*>(xml_char_ptr);
		xmlFree(xml_char_ptr);
		
		// find the "namespace" element
		xmlNodePtr namespace_node = static_cast<xmlNodePtr>(findConfigNodeByName(NAMESPACE_ELEMENT_NAME,
																				 static_cast<xmlNodePtr>(m_vocabulary_node)->children));
		if (namespace_node != NULL) {
			xml_char_ptr = xmlNodeGetContent(namespace_node);
			if (xml_char_ptr != NULL) {
				m_namespace = reinterpret_cast<char*>(xml_char_ptr);
				xmlFree(xml_char_ptr);
			} else m_namespace.clear();
		} else m_namespace.clear();	
		
		// find the "comment" element
		xmlNodePtr comment_node = static_cast<xmlNodePtr>(findConfigNodeByName(COMMENT_ELEMENT_NAME,
																			   static_cast<xmlNodePtr>(m_vocabulary_node)->children));
		if (comment_node != NULL) {
			xml_char_ptr = xmlNodeGetContent(comment_node);
			if (xml_char_ptr != NULL) {
				m_comment = reinterpret_cast<char*>(xml_char_ptr);
				xmlFree(xml_char_ptr);
			} else m_comment.clear();
		} else m_comment.clear();
		
		// this is used to cache all object dependencies
		// these are resolved LAST, to ensure that all Terms already exist first
		std::list<std::pair<std::string,std::string> >	object_dependencies;
		
		// load Vocabulary Terms
		for (xmlNodePtr cur_node = static_cast<xmlNodePtr>(m_vocabulary_node)->children;
			 cur_node != NULL; cur_node = cur_node->next)
		{
			if (cur_node->type == XML_ELEMENT_NODE
				&& xmlStrcmp(cur_node->name, reinterpret_cast<const xmlChar*>(TERM_ELEMENT_NAME.c_str()))==0)
			{
				// parse new term definition
				xml_char_ptr = xmlGetProp(cur_node, reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()));
				if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
					if (xml_char_ptr != NULL)
						xmlFree(xml_char_ptr);
					throw Vocabulary::EmptyTermIdException();
				}
				Vocabulary::Term new_term(reinterpret_cast<char*>(xml_char_ptr));
				xmlFree(xml_char_ptr);
				
				// find the existing "type" node (if any)
				xmlNodePtr type_node = static_cast<xmlNodePtr>(findConfigNodeByName(TYPE_ELEMENT_NAME,
																					cur_node->children));
				if (type_node != NULL) {
					// found a type node (if not found we can leave it as "NULL" (the default)
					xml_char_ptr = xmlNodeGetContent(type_node);
					if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
						if (xml_char_ptr != NULL)
							xmlFree(xml_char_ptr);
						throw EmptyTypeException(new_term.term_id);
					}
					
					// set the term's data type
					const std::string new_term_type(reinterpret_cast<char*>(xml_char_ptr));
					xmlFree(xml_char_ptr);
					new_term.term_type = Vocabulary::parseDataType(new_term_type);
					
					// check for "size" attribute only if type is "char"
					if (new_term.term_type == Vocabulary::TYPE_CHAR) {
						// use a default size of '1' for char data type
						new_term.term_size = 1;
						xml_char_ptr = xmlGetProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()));
						if (xml_char_ptr != NULL) {
							if (xml_char_ptr[0] != '\0')
								new_term.term_size = strtoul(reinterpret_cast<char*>(xml_char_ptr), NULL, 10);
							// make sure it is not equal to 0 (change to 1 if it is)
							if (new_term.term_size == 0)
								new_term.term_size = 1;
							xmlFree(xml_char_ptr);
						}
					}
				}
				
				// find the existing "comment" node (if any)
				xmlNodePtr comment_node = static_cast<xmlNodePtr>(findConfigNodeByName(COMMENT_ELEMENT_NAME,
																					   cur_node->children));
				
				if (comment_node != NULL) {
					// found a comment node (if not found we can leave it empty (the default)
					xml_char_ptr = xmlNodeGetContent(comment_node);
					if (xml_char_ptr != NULL) {
						if (xml_char_ptr[0] != '\0')
							new_term.term_comment = reinterpret_cast<char*>(xml_char_ptr);
						xmlFree(xml_char_ptr);
					}
				}

				// add the new term (finished parsing basic config)
				m_vocabulary.addTerm(new_term);
				m_signal_add_term(new_term);
				PION_LOG_DEBUG(m_logger, "Added Vocabulary Term: " << new_term.term_id);

				// step through the term's members and save them for later
				xmlNodePtr member_node = static_cast<xmlNodePtr>(findConfigNodeByName(MEMBER_ELEMENT_NAME,
																					  cur_node->children));
				while (member_node != NULL) {
					// found a member node -> extract the element's content
					xml_char_ptr = xmlNodeGetContent(member_node);
					if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
						if (xml_char_ptr != NULL)
							xmlFree(xml_char_ptr);
						throw EmptyMemberException(new_term.term_id);
					}
					const std::string member_uri(reinterpret_cast<char*>(xml_char_ptr));
					xmlFree(xml_char_ptr);
					// queue the member_uri for later
					object_dependencies.push_back(std::make_pair(new_term.term_id,
																 member_uri));
					// step ahead to next member node (if any more)
					member_node = static_cast<xmlNodePtr>(findConfigNodeByName(MEMBER_ELEMENT_NAME,
																			   member_node->next));
				}
			}
		}
		
		// process object dependencies LAST
		// AFTER adding all the Terms
		// so that all term_id references can be resolved properly
		for (std::list<std::pair<std::string,std::string> >::iterator i = object_dependencies.begin();
			 i != object_dependencies.end(); ++i)
		{
			m_vocabulary.addObjectMember(i->first, i->second);
			m_signal_add_member(i->first, i->second);
			PION_LOG_DEBUG(m_logger, "Added object member to Vocabulary Term ("
						   << i->first << "): " << i->second);
		}
		
		PION_LOG_INFO(m_logger, "Loaded Vocabulary configuration: " << m_config_file);
		
	} else {

		PION_LOG_INFO(m_logger, "Initializing new Vocabulary configuration: " << m_config_file);

		// create a new vocabulary element
		m_vocabulary_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(VOCABULARY_ELEMENT_NAME.c_str()));
		if (m_vocabulary_node == NULL)
			throw InitializeConfigException(getConfigFile());
		if ((m_vocabulary_node=xmlAddChild(static_cast<xmlNodePtr>(m_config_root_ptr),
										   static_cast<xmlNodePtr>(m_vocabulary_node))) == NULL)
		{
			xmlFreeNode(static_cast<xmlNodePtr>(m_vocabulary_node));
			throw InitializeConfigException(getConfigFile());
		}
		if (xmlNewProp(static_cast<xmlNodePtr>(m_vocabulary_node),
					   reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()),
					   reinterpret_cast<const xmlChar*>(m_vocabulary_id.c_str())) == NULL)
			throw InitializeConfigException(getConfigFile());
		
		// create a namespace child element
		if (! m_namespace.empty()) {
			if (xmlNewTextChild(static_cast<xmlNodePtr>(m_vocabulary_node), NULL,
								reinterpret_cast<const xmlChar*>(NAMESPACE_ELEMENT_NAME.c_str()),
								reinterpret_cast<const xmlChar*>(m_namespace.c_str())) == NULL)
				throw InitializeConfigException(getConfigFile());
		}

		// create a comment child element
		if (! m_comment.empty()) {
			if (xmlNewTextChild(static_cast<xmlNodePtr>(m_vocabulary_node), NULL,
								reinterpret_cast<const xmlChar*>(COMMENT_ELEMENT_NAME.c_str()),
								reinterpret_cast<const xmlChar*>(m_comment.c_str())) == NULL)
				throw InitializeConfigException(getConfigFile());
		}
		
		// save the new XML config file
		saveConfigFile();
	}
}

bool VocabularyConfig::addNewTermTypeConfig(void *term_node, const Vocabulary::Term& t)
{
	const std::string new_type_string(Vocabulary::getDataTypeAsString(t.term_type));
	xmlNodePtr new_type_node = xmlNewTextChild(static_cast<xmlNodePtr>(term_node), NULL,
											   reinterpret_cast<const xmlChar*>(TYPE_ELEMENT_NAME.c_str()),
											   reinterpret_cast<const xmlChar*>(new_type_string.c_str()));
	if (new_type_node == NULL)
		return false;
	// set the size attribute of type if it is non-zero (or if type CHAR)
	if (t.term_size != 0 || t.term_type == Vocabulary::TYPE_CHAR) {
		std::string new_size_string(boost::lexical_cast<std::string>(t.term_size));
		if (t.term_size == 0 && t.term_type == Vocabulary::TYPE_CHAR)
			new_size_string = "1";
		if (xmlNewProp(new_type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()),
					   reinterpret_cast<const xmlChar*>(new_size_string.c_str())) == NULL)
			return false;
	}
	return true;
}
	
void VocabularyConfig::setId(const std::string& new_id)
{
	m_vocabulary_id = new_id;
	
	// update config file only if it is open
	if (m_vocabulary_node != NULL) {
		if (xmlSetProp(static_cast<xmlNodePtr>(m_vocabulary_node),
					   reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()),
					   reinterpret_cast<const xmlChar*>(new_id.c_str())) == NULL)
			throw UpdateVocabularyException(getConfigFile());
		// save the new XML config file
		saveConfigFile();
	}
}

void VocabularyConfig::setNamespace(const std::string& new_namespace)
{
	// change namespace option
	m_namespace = new_namespace;
	
	// update config file only if it is open
	if (m_vocabulary_node != NULL) {
		if (! updateConfigOption(NAMESPACE_ELEMENT_NAME, new_namespace, m_vocabulary_node))
			throw UpdateVocabularyException(getConfigFile());
		// save the new XML config file
		saveConfigFile();
	}
}

void VocabularyConfig::setComment(const std::string& new_comment)
{
	// change comment option
	m_comment = new_comment;
	
	// update config file only if it is open
	if (m_vocabulary_node != NULL) {
		if (! updateConfigOption(COMMENT_ELEMENT_NAME, new_comment, m_vocabulary_node))
			throw UpdateVocabularyException(getConfigFile());
		// save the new XML config file
		saveConfigFile();
	}
}
		
void VocabularyConfig::addTerm(const Vocabulary::Term& new_term)
{
	// make sure that the Vocabulary configuration file is open
	if (m_vocabulary_node == NULL)
		throw VocabularyNotOpenException(getConfigFile());

	// add it to the memory structures
	m_vocabulary.addTerm(new_term);
	m_signal_add_term(new_term);
	
	// add it to the Vocabulary config file
	
	// create a new node for the term and add it to the XML config document
	xmlNodePtr new_term_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(TERM_ELEMENT_NAME.c_str()));
	if (new_term_node == NULL)
		throw AddTermConfigException(new_term.term_id);
	if ((new_term_node=xmlAddChild(static_cast<xmlNodePtr>(m_vocabulary_node), new_term_node)) == NULL) {
		xmlFreeNode(new_term_node);
		throw AddTermConfigException(new_term.term_id);
	}

	// set the id attribute for the term element
	if (xmlNewProp(new_term_node, reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()),
				   reinterpret_cast<const xmlChar*>(new_term.term_id.c_str())) == NULL)
		throw AddTermConfigException(new_term.term_id);

	// add a type child element to the term if it is not null
	if (new_term.term_type != Vocabulary::TYPE_NULL) {
		if (! addNewTermTypeConfig(new_term_node, new_term))
			throw AddTermConfigException(new_term.term_id);
	}

	// add a comment child element to the term if it is not empty
	if (! new_term.term_comment.empty()) {
		if (xmlNewTextChild(new_term_node, NULL,
							reinterpret_cast<const xmlChar*>(COMMENT_ELEMENT_NAME.c_str()),
							reinterpret_cast<const xmlChar*>(new_term.term_comment.c_str())) == NULL)
			throw AddTermConfigException(new_term.term_id);
	}
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Added Vocabulary Term: " << new_term.term_id);
}

void VocabularyConfig::updateTerm(const Vocabulary::Term& t)
{
	// make sure that the Vocabulary configuration file is open
	if (m_vocabulary_node == NULL)
		throw VocabularyNotOpenException(getConfigFile());
	
	// update the values in memory
	m_vocabulary.updateTerm(t);
	m_signal_update_term(t);

	// update it within the Vocabulary config file
	
	// find the term element in the XML config document
	xmlNodePtr term_node = static_cast<xmlNodePtr>(findConfigNodeByAttr(TERM_ELEMENT_NAME,
																		ID_ATTRIBUTE_NAME,
																		t.term_id,
																		static_cast<xmlNodePtr>(m_vocabulary_node)->children));
	if (term_node == NULL)
		throw UpdateTermConfigException(t.term_id);
	
	// find the existing "type" node (if any)
	xmlNodePtr type_node = static_cast<xmlNodePtr>(findConfigNodeByName(TYPE_ELEMENT_NAME,
																		term_node->children));
	if (type_node == NULL) {
		// no type node currently exists
		// add a new one, so long as the new type is not "NULL"
		if (t.term_type != Vocabulary::TYPE_NULL) {
			if (! addNewTermTypeConfig(term_node, t))
				throw UpdateTermConfigException(t.term_id);
		}
	} else {
		// look for the existing size attribute
		const std::string new_size_string(boost::lexical_cast<std::string>(t.term_size));
		xmlAttrPtr size_attr_ptr = xmlHasProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()));
		if (size_attr_ptr == NULL) {
			// no size attribute currently defined -> add a new one if size != 0
			if (t.term_size != 0) {
				if (xmlNewProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()),
							   reinterpret_cast<const xmlChar*>(new_size_string.c_str())) == NULL)
					throw UpdateTermConfigException(t.term_id);
			}
		} else if (t.term_size == 0) {
			// size is being changed to "0" -> remove the existing attribute
			xmlUnsetProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()));
		} else {
			// update the value of the existing size attribute
			xmlSetProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()),
					   reinterpret_cast<const xmlChar*>(new_size_string.c_str()));
		}
		// update the content of the type attribute
		const std::string new_type_string(Vocabulary::getDataTypeAsString(t.term_type));
		xmlNodeSetContent(type_node, reinterpret_cast<const xmlChar*>(new_type_string.c_str()));
	}

	// find the existing "comment" node (if any)
	xmlNodePtr comment_node = static_cast<xmlNodePtr>(findConfigNodeByName(COMMENT_ELEMENT_NAME,
																		   term_node->children));
	if (comment_node == NULL) {
		// no comment node currently exists
		// add a new one, so long as the new comment is not empty
		if (! t.term_comment.empty()) {
			if (xmlNewTextChild(term_node, NULL,
								reinterpret_cast<const xmlChar*>(COMMENT_ELEMENT_NAME.c_str()),
								reinterpret_cast<const xmlChar*>(t.term_comment.c_str())) == NULL)
				throw UpdateTermConfigException(t.term_id);
		}
	} else {
		// change the value for the existing comment node
		xmlNodeSetContent(comment_node, reinterpret_cast<const xmlChar*>(t.term_comment.c_str()));
	}
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Updated Vocabulary Term: " << t.term_id);
}
	
void VocabularyConfig::removeTerm(const std::string& term_id)
{
	// make sure that the Vocabulary configuration file is open
	if (m_vocabulary_node == NULL)
		throw VocabularyNotOpenException(getConfigFile());
	
	// remove the Term from our memory structures
	m_vocabulary.removeTerm(term_id);
	m_signal_remove_term(term_id);
	
	// remove it from the Vocabulary config file
	xmlNodePtr term_node = static_cast<xmlNodePtr>(findConfigNodeByAttr(TERM_ELEMENT_NAME,
																		ID_ATTRIBUTE_NAME,
																		term_id,
																		static_cast<xmlNodePtr>(m_vocabulary_node)->children));
	if (term_node == NULL)
		throw RemoveTermConfigException(term_id);
	xmlUnlinkNode(term_node);
	xmlFreeNodeList(term_node);
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Removed Vocabulary Term: " << term_id);
}

void VocabularyConfig::addObjectMember(const std::string& object_term_id,
									   const std::string& member_term_id)
{
	// make sure that the Vocabulary configuration file is open
	if (m_vocabulary_node == NULL)
		throw VocabularyNotOpenException(getConfigFile());
	
	// add it to the memory structures
	m_vocabulary.addObjectMember(object_term_id, member_term_id);
	m_signal_add_member(object_term_id, member_term_id);
	
	// add the member to the Vocabulary config file
	
	// find the term element in the XML config document
	xmlNodePtr term_node = static_cast<xmlNodePtr>(findConfigNodeByAttr(TERM_ELEMENT_NAME,
																		ID_ATTRIBUTE_NAME,
																		object_term_id,
																		static_cast<xmlNodePtr>(m_vocabulary_node)->children));
	if (term_node == NULL)
		throw AddMemberConfigException(member_term_id);
	
	// add the member element to the document tree
	if (xmlNewTextChild(term_node, NULL, reinterpret_cast<const xmlChar*>(MEMBER_ELEMENT_NAME.c_str()),
						reinterpret_cast<const xmlChar*>(member_term_id.c_str())) == NULL)
		throw AddMemberConfigException(member_term_id);
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Added object member to Vocabulary Term ("
				   << object_term_id << "): " << member_term_id);
}

void VocabularyConfig::removeObjectMember(const std::string& object_term_id,
										  const std::string& member_term_id)
{
	// make sure that the Vocabulary configuration file is open
	if (m_vocabulary_node == NULL)
		throw VocabularyNotOpenException(getConfigFile());
	
	// remove it from the memory structures
	m_vocabulary.removeObjectMember(object_term_id, member_term_id);
	m_signal_remove_member(object_term_id, member_term_id);

	// remove it from the Vocabulary config file

	// find the term element in the XML config document
	xmlNodePtr term_node = static_cast<xmlNodePtr>(findConfigNodeByAttr(TERM_ELEMENT_NAME,
																		ID_ATTRIBUTE_NAME,
																		object_term_id,
																		static_cast<xmlNodePtr>(m_vocabulary_node)->children));
	// throw exception if we were unable to find it within the XML doc
	if (term_node == NULL)
		throw RemoveMemberConfigException(member_term_id);
	
	// find the matching member element node
	xmlNodePtr member_node = static_cast<xmlNodePtr>(findConfigNodeByContent(MEMBER_ELEMENT_NAME,
																			 member_term_id,
																			 term_node->children));
	// throw exception if we were unable to find it within the XML doc
	if (member_node == NULL)
		throw RemoveMemberConfigException(member_term_id);
	
	// remove the node from the XML config document tree
	xmlUnlinkNode(member_node);
	xmlFreeNodeList(member_node);
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Removed member from Vocabulary object Term ("
				   << object_term_id << "): " << member_term_id);
}	

}	// end namespace platform
}	// end namespace pion
