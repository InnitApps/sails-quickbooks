/*
 * Jsonix is a JavaScript library which allows you to convert between XML
 * and JavaScript object structures.
 *
 * Copyright (c) 2010, Aleksei Valikov, Highsource.org
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Aleksei Valikov nor the
 *       names of contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL ALEKSEI VALIKOV BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

Jsonix.Model.ClassInfo = Jsonix.Class({
	name : null,
	baseTypeInfo : null,
	properties : null,
	structure : null,
	defaultElementNamespaceURI : '',
	defaultAttributeNamespaceURI : '',
	initialize : function(options) {
		Jsonix.Util.Ensure.ensureObject(options);
		Jsonix.Util.Ensure.ensureString(options.name);
		this.name = options.name;
		if (Jsonix.Util.Type.isString(options.defaultElementNamespaceURI)) {
			this.defaultElementNamespaceURI = options.defaultElementNamespaceURI;
		}
		if (Jsonix.Util.Type.isString(options.defaultAttributeNamespaceURI)) {
			this.defaultAttributeNamespaceURI = options.defaultAttributeNamespaceURI;
		}
		if (Jsonix.Util.Type.exists(options.baseTypeInfo)) {
			Jsonix.Util.Ensure.ensureObject(options.baseTypeInfo);
			this.baseTypeInfo = options.baseTypeInfo;
		}
		this.properties = [];
		if (Jsonix.Util.Type.exists(options.properties)) {
			Jsonix.Util.Ensure.ensureArray(options.properties);
			for ( var index = 0; index < options.properties.length; index++) {
				this.properties[index] = options.properties[index];
			}
		}
	},
	destroy : function() {
	},
	build : function(context) {
		if (this.structure !== null) {
			return;
		}
		var structure = {
			elements : null,
			attributes : {},
			anyAttribute : null,
			value : null,
			any : null
		};
		if (Jsonix.Util.Type.exists(this.baseTypeInfo)) {
			this.baseTypeInfo.buildStructure(context, structure);
		}
		this.buildStructure(context, structure);
		this.structure = structure;
	},
	buildStructure : function(context, structure) {
		for ( var index = 0; index < this.properties.length; index++) {
			var propertyInfo = this.properties[index];
			propertyInfo.buildStructure(context, structure);
		}
	},
	unmarshal : function(context, input) {
		this.build(context);
		var result = {
			TYPE_NAME : this.name
		};

		if (input.eventType !== 1) {
			throw "Parser must be on START_ELEMENT to read a class info.";
		}

		// Read attributes
		if (Jsonix.Util.Type.exists(this.structure.attributes)) {
			var attributeCount = input.getAttributeCount();
			if (attributeCount !== 0) {
				for ( var index = 0; index < attributeCount; index++) {
					var attributeNameKey = input.getAttributeNameKey(index);
					if (Jsonix.Util.Type.exists(this.structure.attributes[attributeNameKey])) {
						var attributeValue = input.getAttributeValue(index);
						if (Jsonix.Util.Type.isString(attributeValue))
						{
							var attributePropertyInfo = this.structure.attributes[attributeNameKey];
							this.unmarshalPropertyValue(context, input, attributePropertyInfo, result, attributeValue);
						}
					}
				}
			}
		}
		// Read any attribute
		if (Jsonix.Util.Type.exists(this.structure.anyAttribute)) {
			var propertyInfo = this.structure.anyAttribute;
			this.unmarshalProperty(context, input, propertyInfo, result);
		}
		// Read elements
		if (Jsonix.Util.Type.exists(this.structure.elements)) {

			var et = input.next();
			while (et !== Jsonix.XML.Input.END_ELEMENT) {
				if (et === Jsonix.XML.Input.START_ELEMENT) {
					// New sub-element starts
					var elementNameKey = input.getNameKey();
					if (Jsonix.Util.Type.exists(this.structure.elements[elementNameKey])) {
						var elementPropertyInfo = this.structure.elements[elementNameKey];
						this.unmarshalProperty(context, input, elementPropertyInfo, result);
					} else if (Jsonix.Util.Type.exists(this.structure.any)) {
						// TODO Refactor

						var anyPropertyInfo = this.structure.any;
						this.unmarshalProperty(context, input, anyPropertyInfo, result);
					} else {
						// TODO report a validation error that element
						// is not expected
						throw 'Unexpected element [' + elementNameKey + '].';
					}
				} else if ((et === Jsonix.XML.Input.CHARACTERS || et === Jsonix.XML.Input.CDATA || et === Jsonix.XML.Input.ENTITY_REFERENCE) && Jsonix.Util.Type.exists(this.structure.mixed)) {
					// Characters and structure has a mixed property
					var mixedPropertyInfo = this.structure.mixed;
					this.unmarshalProperty(context, input, mixedPropertyInfo, result);
				} else if (et === Jsonix.XML.Input.SPACE || et === Jsonix.XML.Input.COMMENT || et === Jsonix.XML.Input.PROCESSING_INSTRUCTION) {
					// Ignore
				} else {
					throw "Illegal state: unexpected event type [" + et + "].";
				}
				et = input.next();
			}
		} else if (Jsonix.Util.Type.exists(this.structure.value)) {
			var valuePropertyInfo = this.structure.value;
			this.unmarshalProperty(context, input, valuePropertyInfo, result);
		} else {
			// Just skip everything
			input.nextTag();
		}
		if (input.eventType !== 2) {
			throw "Illegal state: must be END_ELEMENT.";
		}
		return result;
	},
	unmarshalProperty : function(context, input, propertyInfo, result) {
		var propertyValue = propertyInfo.unmarshal(context, this, input);
		propertyInfo.setProperty(result, propertyValue);
	},
	unmarshalPropertyValue : function(context, input, propertyInfo, result, value) {
		var propertyValue = propertyInfo.unmarshalValue(context, this, input, value);
		propertyInfo.setProperty(result, propertyValue);
	},
	marshal : function(context, value, output) {
		// TODO This must be reworked
		if (Jsonix.Util.Type.exists(this.baseTypeInfo)) {
			this.baseTypeInfo.marshal(context, value, output);
		}
		for ( var index = 0; index < this.properties.length; index++) {
			var propertyInfo = this.properties[index];
			var propertyValue = value[propertyInfo.name];
			if (Jsonix.Util.Type.exists(propertyValue)) {
				propertyInfo.marshal(context, this, propertyValue, output);
			}
		}
	},
	isInstance : function(value) {
		return Jsonix.Util.Type.isObject(value) && Jsonix.Util.Type.isString(value.TYPE_NAME) && value.TYPE_NAME === this.name;
	},
	b : function(baseTypeInfo) {
		Jsonix.Util.Ensure.ensureObject(baseTypeInfo);
		this.baseTypeInfo = baseTypeInfo;
		return this;
	},
	ps : function() {
		return this;
	},
	addProperty : function(property) {
		this.properties.push(property);
		return this;
	},
	aa : function(options) {
		this.addDefaultNamespaces(options);
		return this.addProperty(new Jsonix.Model.AnyAttributePropertyInfo(options));
	},
	ae : function(options) {
		this.addDefaultNamespaces(options);
		return this.addProperty(new Jsonix.Model.AnyElementPropertyInfo(options));
	},
	a : function(options) {
		this.addDefaultNamespaces(options);
		return this.addProperty(new Jsonix.Model.AttributePropertyInfo(options));
	},
	em : function(options) {
		this.addDefaultNamespaces(options);
		return this.addProperty(new Jsonix.Model.ElementMapPropertyInfo(options));
	},
	e : function(options) {
		this.addDefaultNamespaces(options);
		return this.addProperty(new Jsonix.Model.ElementPropertyInfo(options));
	},
	es : function(options) {
		this.addDefaultNamespaces(options);
		return this.addProperty(new Jsonix.Model.ElementsPropertyInfo(options));
	},
	er : function(options) {
		this.addDefaultNamespaces(options);
		return this.addProperty(new Jsonix.Model.ElementRefPropertyInfo(options));
	},
	ers : function(options) {
		this.addDefaultNamespaces(options);
		return this.addProperty(new Jsonix.Model.ElementRefsPropertyInfo(options));
	},
	v : function(options) {
		this.addDefaultNamespaces(options);
		return this.addProperty(new Jsonix.Model.ValuePropertyInfo(options));
	},
	addDefaultNamespaces : function(options) {
		if (Jsonix.Util.Type.isObject(options)) {
			if (!Jsonix.Util.Type.isString(options.defaultElementNamespaceURI)) {
				options.defaultElementNamespaceURI = this.defaultElementNamespaceURI;
			}
			if (!Jsonix.Util.Type.isString(options.defaultAttributeNamespaceURI)) {
				options.defaultAttributeNamespaceURI = this.defaultAttributeNamespaceURI;
			}
		}
	},
	CLASS_NAME : 'Jsonix.Model.ClassInfo'
});