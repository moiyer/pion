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

#include <yajl/yajl_parse.h>
#include <yajl/yajl_gen.h>
#include <pion/platform/ConfigManager.hpp>
#include "JSONCodec.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of JSONCodec
const std::string			JSONCodec::CONTENT_TYPE = "text/json";
const std::string			JSONCodec::FIELD_ELEMENT_NAME = "Field"; // TODO: Shouldn't this really be Codec::FIELD_ELEMENT_NAME?
const std::string			JSONCodec::TERM_ATTRIBUTE_NAME = "term"; // TODO: Shouldn't this really be Codec::TERM_ATTRIBUTE_NAME?
const unsigned int			JSONCodec::READ_BUFFER_SIZE = 4096;	     // TODO: What should this be?


// JSONCodec member functions

CodecPtr JSONCodec::clone(void) const
{
	JSONCodec *new_codec(new JSONCodec());
	new_codec->copyCodec(*this);
	for (CurrentFormat::const_iterator i = m_format.begin(); i != m_format.end(); ++i) {
		new_codec->mapFieldToTerm((*i)->field_name, (*i)->term, (*i)->ordinal);
	}
	new_codec->m_max_term_ref = m_max_term_ref;
	return CodecPtr(new_codec);
}

void JSONCodec::write(std::ostream& out, const Event& e)
{
	if (m_no_events_written) {
		yajl_gen_config conf;
		conf.beautify = 0;
		m_yajl_generator = yajl_gen_alloc(&conf);
		yajl_gen_array_open(m_yajl_generator);
		m_no_events_written = false;
	}

	// output '{' to mark the beginning of the event
	yajl_gen_map_open(m_yajl_generator);

	typedef std::pair<pion::platform::Event::ConstIterator, pion::platform::Event::ConstIterator> TermRefRange;
	typedef boost::shared_ptr<TermRefRange> TermRefRangePtr;
	std::vector<TermRefRangePtr> term_ref_ranges(m_max_term_ref + 1);

	// iterate through each field in the current format
	CurrentFormat::const_iterator i;
	for (i = m_format.begin(); i != m_format.end(); ++i) {
		// get the range of values for the TermRef, if we don't have it yet
		pion::platform::Vocabulary::TermRef term_ref = (*i)->term.term_ref;
		if (!term_ref_ranges[term_ref])
			term_ref_ranges[term_ref] = TermRefRangePtr(new TermRefRange(e.equal_range(term_ref)));

		// if there are no more values for the TermRef, skip this field, else write the next value and increment the start of the range
		if (term_ref_ranges[term_ref]->first == term_ref_ranges[term_ref]->second) {
			// TODO: this may result in incorrect output if there are multiple fields with the same TermRef in the configuration.
			// Figure out what to do in this case.
		} else {
			yajl_gen_string(m_yajl_generator, (unsigned char*)(*i)->field_name.c_str(), (*i)->field_name.size());
			switch ((*i)->term.term_type) {
				case pion::platform::Vocabulary::TYPE_INT8:
				case pion::platform::Vocabulary::TYPE_INT16:
				case pion::platform::Vocabulary::TYPE_INT32:
					yajl_gen_integer(m_yajl_generator, boost::get<boost::int32_t>(term_ref_ranges[term_ref]->first->value));
					break;
				case pion::platform::Vocabulary::TYPE_INT64:
					{
						std::ostringstream oss;
						oss << boost::get<boost::int64_t>(term_ref_ranges[term_ref]->first->value);
						yajl_gen_string(m_yajl_generator, (unsigned char*)oss.str().c_str(), oss.str().size());
					}
					break;
				case pion::platform::Vocabulary::TYPE_UINT8:
				case pion::platform::Vocabulary::TYPE_UINT16:
				case pion::platform::Vocabulary::TYPE_UINT32:
					yajl_gen_integer(m_yajl_generator, boost::get<boost::uint32_t>(term_ref_ranges[term_ref]->first->value));
					break;
				case pion::platform::Vocabulary::TYPE_UINT64:
					{
						std::ostringstream oss;
						oss << boost::get<boost::uint64_t>(term_ref_ranges[term_ref]->first->value);
						yajl_gen_string(m_yajl_generator, (unsigned char*)oss.str().c_str(), oss.str().size());
					}
					break;
				default:
					throw PionException("not supported yet");
			}
			++term_ref_ranges[term_ref]->first;
		}
	}

	// output '}' to mark the end of the event
	yajl_gen_map_close(m_yajl_generator);

	const unsigned char* buf;
	unsigned int len;
	yajl_gen_get_buf(m_yajl_generator, &buf, &len);
	out.write((char*)buf, len);
	yajl_gen_clear(m_yajl_generator);

	// flush the output stream
	if (m_flush_after_write)
		out.flush();
}

void JSONCodec::finish(std::ostream& out)
{
	if (m_no_events_written)
		return;

	// write the JSON array end token ']'
	yajl_gen_array_close(m_yajl_generator);
	const unsigned char* buf;
	unsigned int len;
	yajl_gen_get_buf(m_yajl_generator, &buf, &len);
	out.write((char*)buf, len);
	yajl_gen_clear(m_yajl_generator);

	// we're done with the generator, so release it
	yajl_gen_free(m_yajl_generator);
	m_yajl_generator = NULL;
}

int number_handler(void* ctx, const char* number_char_ptr, unsigned int number_len)
{
	Context* c = (Context*)ctx;
	JSONCodec::JSONObject& json_object = *c->json_object_ptr;
	json_object[c->ordinal] = std::string(number_char_ptr, number_len);

	return 1;
}

int map_key_handler(void* ctx, const unsigned char* stringVal, unsigned int stringLen)
{
	Context* c = (Context*)ctx;
	JSONCodec::FieldMap::const_iterator i = c->field_map.find(std::string((char*)stringVal, stringLen));
	c->ordinal = i->second->ordinal;

	return 1;
}

int start_map_handler(void* ctx)
{
	Context* c = (Context*)ctx;
	c->json_object_ptr = JSONCodec::JSONObjectPtr(new JSONCodec::JSONObject(c->field_map.size()));
	
	return 1;
}

int end_map_handler(void* ctx)
{
	Context* c = (Context*)ctx;
	c->json_object_queue.push(c->json_object_ptr);

	return 1;
}

int start_array_handler(void* ctx)
{
	return 1;
}

int end_array_handler(void* ctx)
{
	return 1;
}

static yajl_callbacks callbacks = {
	NULL,
	NULL,
	NULL,
	NULL,
	number_handler,
	NULL,
	start_map_handler,
	map_key_handler,
	end_map_handler,
	start_array_handler,
	end_array_handler
};


bool JSONCodec::read(std::istream& in, Event& e)
{
	char data[READ_BUFFER_SIZE];

	if (e.getType() != getEventType())
		throw WrongEventTypeException();

	e.clear();

	if (m_no_events_read) {
		yajl_parser_config cfg = { 1, 1 };
		m_context = boost::shared_ptr<Context>(new Context(m_field_map, m_json_object_queue));
		m_yajl_handle = yajl_alloc(&callbacks, &cfg, (void*)m_context.get());
		m_no_events_read = false;
	}

	while (m_json_object_queue.empty()) {
		std::streamsize num_bytes_read = in.readsome(data, READ_BUFFER_SIZE - 1);
		if (num_bytes_read == 0)
			return false;

		data[num_bytes_read] = 0;

		size_t len = strlen(data);
		yajl_status stat = yajl_parse(m_yajl_handle, (unsigned char*)data, len);

		if (stat == yajl_status_ok) {
			// The queue should have an event now.
			break;
		} else if (stat == yajl_status_insufficient_data) {
			// The queue might or might not have an event now, so continue.
			// If the queue is still empty, more data will be read in.
		} else {
			// TODO: handle yajl_status_client_canceled and yajl_status_error
			return false;
		}
	}

	JSONCodec::JSONObjectPtr json_object_ptr = m_json_object_queue.front();
	m_json_object_queue.pop();
	const JSONCodec::JSONObject& json_object = *json_object_ptr;

	for (CurrentFormat::size_type i = 0; i < m_format.size(); ++i) {
		const std::string& value_str = json_object[i];
		// TODO: handle case value_str.empty()

		const pion::platform::Vocabulary::Term& term = m_format[i]->term;

		switch (term.term_type) {
			case pion::platform::Vocabulary::TYPE_INT8:
			case pion::platform::Vocabulary::TYPE_INT16:
			case pion::platform::Vocabulary::TYPE_INT32:
				e.setInt(term.term_ref, boost::lexical_cast<boost::int32_t>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_INT64:
				e.setBigInt(term.term_ref, boost::lexical_cast<boost::int64_t>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_UINT8:
			case pion::platform::Vocabulary::TYPE_UINT16:
			case pion::platform::Vocabulary::TYPE_UINT32:
				e.setUInt(term.term_ref, boost::lexical_cast<boost::uint32_t>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_UINT64:
				e.setUBigInt(term.term_ref, boost::lexical_cast<boost::uint64_t>(value_str));
				break;

			// TODO: handle other cases

			default:
				return false;
		}
	}

	return true;
}

void JSONCodec::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Codec base class
	m_field_map.clear();
	Codec::setConfig(v, config_ptr);

	// TODO: options

	// next, map the fields to Terms
	int ordinal = 0;
	m_max_term_ref = 0;
	xmlNodePtr codec_field_node = config_ptr;
	while ( (codec_field_node = ConfigManager::findConfigNodeByName(FIELD_ELEMENT_NAME, codec_field_node)) != NULL) {
		// parse new field mapping

		// start with the name of the field (element content)
		xmlChar *xml_char_ptr = xmlNodeGetContent(codec_field_node);
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyFieldException(getId());
		}
		const std::string field_name(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);

		// next get the Term we want to map to
		xml_char_ptr = xmlGetProp(codec_field_node, reinterpret_cast<const xmlChar*>(TERM_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyTermException(getId());
		}
		const std::string term_id(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);

		// make sure that the Term is valid
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(term_id);

		// add the field mapping
		mapFieldToTerm(field_name, v[term_ref], ordinal);
		++ordinal;

		// step to the next field mapping
		codec_field_node = codec_field_node->next;

		if (term_ref > m_max_term_ref)
			m_max_term_ref = term_ref;
	}
}

void JSONCodec::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Codec base class that might be needed
	Codec::updateVocabulary(v);

	// ...
}


}	// end namespace plugins
}	// end namespace pion


/// creates new JSONCodec objects
extern "C" PION_PLUGIN_API pion::platform::Codec *pion_create_JSONCodec(void) {
	return new pion::plugins::JSONCodec();
}

/// destroys JSONCodec objects
extern "C" PION_PLUGIN_API void pion_destroy_JSONCodec(pion::plugins::JSONCodec *codec_ptr) {
	delete codec_ptr;
}
