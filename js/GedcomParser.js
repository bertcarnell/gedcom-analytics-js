/* 
 * Copyright 2015 Robert Carnell
 * See the included LICENSE file for licensing details
 * 
 * Based on parser.js by https://github.com/jswale/gedcom-js-viewer originally
 * Licensed under the MIT license
 */

// Dependencies:  prototype.js

/* define global variables from other scripts for JSLint */
/*global Ajax, Class*/

/*
 * Namespace GedcomAnalytics
 * Either pre-defined or new
 * @type @exp;GedcomAnalytics
 */
var GedcomAnalytics = GedcomAnalytics || {};

// create a class GedcomParser
GedcomAnalytics.GedcomParser = Class.create();

// create the class prototype
GedcomAnalytics.GedcomParser.prototype = {
    /*
     * Gedcom Lines
     * @type ????
     */
	gedcomLines : null,

    /*
     * Initialize GedcomParser
     * @returns {undefined}
     */
	initialize : function() {
        GedcomAnalytics.Utilities.printInfo("Initialize GedcomParser");
    },

    /**
     * Load a GEDCOM file using Ajax and parse the file
     * @param {String} file A GEDCOM file
     * @returns {undefined}
     */
	load : function(file) {
        GedcomAnalytics.Utilities.printInfo("GedcomParser.load " + file);
		new Ajax.Request(file, {
			method: 'GET',
			onSuccess : function(response) {
                GedcomAnalytics.Utilities.printInfo("GedcomParser.load success");
    			this.parse(response.responseText);
			}.bind(this)
		});
	},

    /**
     * Create a node obect without children
     * In the GEDCOM File, [level] [type] [value] like 1 NAME My /Name/
     * @param {String} type The type of GEDCOM entry
     * @param {String} value The value of the GEDCOM entry
     * @param {String} level The numeric level of the GEDCOM entry as a String
     * @returns {GedcomAnalytics.GedcomParser.prototype.node} an object with elements: value, type, level, childs
     */
	createNode : function(type, value, level) {
		return {
			value : value,
			type : type,
			level : level,
			children : []
		};
	},

    /**
     * Parse a GEDCOM file by lines and call the analyze method
     * @param {String} gedcomString The GEDCOM file
     * @returns {}
     */
	parse : function(gedcomString) 
    {
        // find the locations of the line breaks
		var lines = gedcomString.match(/[^\r\n]+/g);
        GedcomAnalytics.Utilities.printInfo("GEDCOM lines: " + lines.length);

		// Create root node
		var tree = this.createNode(null, null, null);

		// Initialise parents
		var parents = [tree];

		// Previous node level
		var previousLevel = null;

        for (ii = 0; ii < lines.length; ii++)
        {
            var current = splitLine(lines[ii]);

            // if the line does not match the criteria, current will be null
            if (null == current) 
            {
                return;
            }

            // Réduction de la liste des parents
            if (null != previousLevel && current.level <= previousLevel) 
            {
                $R(current.level, previousLevel).each(function() {
                            parents.pop();
                        }, this);
            }

            // Recherche du dernier parent
            parent = parents[parents.length - 1];

            if (current.ident == GedcomConst.indicator.append || current.ident == GedcomConst.indicator.newLine) 
            {
                node = parent;
                var key = (node.level == 0) ? "text" : "value";

                var v = current.value || "";
                if (Object.isUndefined(node[key])) {
                    node[key] = v;
                } else {
                    node[key] += (current.ident == GedcomConst.indicator.newLine ? "<br/>" : "") + v;
                }

            } 
            else 
            {
                // Nouveau noeud
                var node = this.node(current.ident, current.value, current.level);

                // Ajout du nouveau noeud au parent
                parent.childs.push(node);
            }

            // Ajout du dernier noeud en tant que parent
            parents.push(node);

            // Mémorisation du niveau du noeud
            previousLevel = current.level;
        }
        
		// analyze
		this.analyze(tree);
	},

	getData : function(id) {
		return this.DATAS.get(id);
	},

	analyze : function(data) {
		log.info();
		log.info("Parser::Extraction :");

		this.DATAS = $H();
		(data.childs || []).each(function(child, i) {
					try {

						var data = null;

						if (GedcomConst.indicator.personne == child.value) {
							data = new Personne(child);
						} else if (GedcomConst.indicator.famille == child.value) {
							data = new Famille(child);
						} else if (GedcomConst.indicator.source == child.value) {
							data = new Source(child);
						} else if (GedcomConst.indicator.note == child.value) {
							data = new Note(child);
						} else {
							log.warn("Parser::analyze -> unknow -> " + child.type
									+ (child.value ? ' (' + child.value + ')' : ''));
						}

						if (data) {
							this.DATAS.set(child.type, data);
						}

					} catch (e) {
						log.error("Parser::analyze -> each", e);
					}
				}, this);

		log.debug(this.DATAS.size() + " bloc chargés");

		// Post traitement
		var options = [];
		[GedcomConst.indicator.personne, GedcomConst.indicator.famille].each(function(type) {
					try {
						log.debug("Parser::analyze -> inject for " + type);
						this.DATAS.each(function(pair) {
									if (pair.value.type != type) {
										return;
									}
									try {
										if (Object.isFunction(pair.value.inject)) {
											pair.value.inject(this);
										}
										if (pair.value.type == GedcomConst.indicator.personne && pair.value.isPublic()) {
											options.push({
														text : pair.value.getDisplayName(GedcomLang.$.viewer.multipleNameSeparator),
														value : pair.value.id
													});
										}
									} catch (e) {
										log.error("Parser::analyze -> inject", e);
									}
								}, this);
					} catch (e) {
						log.error("Parser::inject -> each", e);
					}
				}, this);

		GedcomIHM.fillQuickValues(options);

		GedcomToolbox.show();

	}
};

GedcomAnalytics.GedcomParser.getChild = function(n, type, value) {
	if (null == n) {
		return null;
	}
	var v = (n.childs || []).find(function(c) {
				return c.type == type;
			});
	if (v && value) {
		v = v.value;
	}
	return v;
};

GedcomAnalytics.GedcomParser.getChilds = function(n, type, value) {
	var res = [];
	(n.childs || []).each(function(c) {
				if (c.type == type) {
					if (value) {
						res.push(c.value);
					} else {
						res.push(c);
					}
				}
			});
	return res;
};

GedcomAnalytics.GedcomParser.extractDateAndPlace = function(n) {
	if (null == n) {
		return null;
	}
	return {
		value : n.value,
		date : this.getChild(n, "DATE", true),
		place : this.getChild(n, "PLAC", true),
		address : this.getChild(n, "ADDR", true),
		age : this.getChild(n, "AGE", true),
		source : this.getChild(n, "SOUR", true),
		notes : this.getChilds(n, "NOTE", true)
	};
};

GedcomAnalytics.GedcomParser.splitLine = function(line) 
{
    /*
     * regular experession /pattern/modifiers
     * find one or more digits (\d+)
     * find a space
     * find none or one ([@][^ ]+[@])
     * find none or one spaces
     * find none or more not-spaces ([^ ]*)
     * find zero or one space ?
     * find none or more elements (.*)?
     * the string is specified by
     * GEDCOM 5.5.1 draft: level + delim + [optional_xref_ID] + tag + [optional_line_value] + terminator
     */
	var result = line.match(/(\d+) ([@][^ ]+[@])? ?([^ ]*) ?(.*)?/);
        
	// if result is null, return
    if (null == result) {
        return null;
    }
        
    // first element is the whole line if it matched
    // the next four elements match the four segments of the regular expression
    if (result.length == 5)
    {
        var level = (typeof result[1] === "undefined") ? "" : result[1];
        var xref = (typeof result[2] === "undefined") ? "" : result[2];
        var tag = (typeof result[3] === "undefined") ? "" : result[3];
        var value = (typeof result[4] === "undefined") ? "" : result[4];

        return {
            level : level,
            tag : tag,
            value : value,
            xref : xref
        };
    }
        
    return null;
};
