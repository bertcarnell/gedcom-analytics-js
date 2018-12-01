/* 
 * Copyright 2015 Robert Carnell
 * See the included LICENSE file for licensing details
 * 
 * Based on parser.js by https://github.com/jswale/gedcom-js-viewer originally
 * Licensed under the MIT license
 */

// Dependencies:  prototype.js

/* define global variables from other scripts for JSLint */
/*global Class*/

/*
 * Namespace GedcomAnalytics
 * Either pre-defined or new
 * @type @exp;GedcomAnalytics
 */
var GedcomAnalytics = GedcomAnalytics || {};

// create a class GedcomParser
GedcomAnalytics.Tree = Class.create();
GedcomAnalytics.Node = Class.create();

// create the class prototype
GedcomAnalytics.Tree.prototype = {
    nodes : [],
    objects : [],
    posits : [],
    /**
     * initialize a Tree
     * @returns {undefined}
     */
    initialize : function() {},
    clear : function() {
      this.nodes = [];
      this.objects = [];
      this.posits = [];
    },
    /**
     * Get nodes on the Tee
     * @returns {Array} an array of GedcomAnalytics.Node elements
     */
    getNodes : function() {return this.nodes;},
    getObjects : function() {return this.objects;},
    addNode : function(node) {return this.nodes.push(node);},
    addObject : function(object) {return this.objects.push(object);},
    addObjectAndDefaultNode : function(object)
    {
      var tempnode = new GedcomAnalytics.Node();
      this.addNode(tempnode);
      return this.addObject(object);
    },
    indexOf : function(objectFunction)
    {
        if (typeof objectFunction != "function")
        {
            return -1;
        }
        for (ii = 0; ii < this.objects.length; ii++)
        {
            if (objectFunction(this.objects[ii]))
            {
                return ii;
            }
        }
        return -1;
    },
    updateNodeAt : function(index, parents, spouses, children)
    {
        if (this.nodes.length <= index || this.objects.length <= index)
        {
            return false;
        }
        this.nodes[index].id = this.objects[index].id;
        this.nodes[index].parents = [];
        this.nodes[index].spouses = [];
        this.nodes[index].children = [];
        for (ii = 0; ii < parents.length; ii++) this.nodes[index].parents.push(parents[ii]);
        for (ii = 0; ii < spouses.length; ii++) this.nodes[index].spouses.push(spouses[ii]);
        for (ii = 0; ii < children.length; ii++) this.nodes[index].children.push(children[ii]);
        return true;
    },
    getParentsAt : function(index) {return this.nodes[index].parents;},
    getChildrenAt : function(index) {return this.nodes[index].children;},
    getSpousesAt : function(index) {return this.nodes[index].spouses;},
    setPosit : function(index) {this.posits = []; this.posits.push(index);},
    stepUp : function() {
        var allParents = [];
        for (ii = 0; ii < this.posits.length; ii++)
        {
            allParents.concat(getParentsAt[this.posits[ii]]);
        }
        this.posits = allParents;
        return allParents;
    },
    stepDown : function(){
        var allChildren = [];
        for (ii = 0; ii < this.posits.length; ii++)
        {
            allChildren.concat(getChildrenAt[this.posits[ii]]);
        }
        this.posits = allChildren;
        return allChildren;
    }
};

GedcomAnalytics.Node.prototype = {
    id : null,
    parents : [],
    spouses : [],
    children : [],
    initialize : function() {}
};


