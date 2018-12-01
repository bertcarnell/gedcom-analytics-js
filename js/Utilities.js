/* 
 * Copyright 2015 Robert Carnell
 * See the included LICENSE file for licensing details
 */

/*
 * Namespace GedcomAnalytics
 * Either pre-defined or new
 * @type @exp;GedcomAnalytics
 */
var GedcomAnalytics = GedcomAnalytics || {};

/**
 * Print message according to level and log level
 * @param {String} msg
 * @param {Settings.logEnum} level
 * @returns {undefined}
 */
GedcomAnalytics.printBase = function(msg, level) {
    if (GedcomAnalytics.GedcomSettings.logLevel >= level){
        console.log(msg);
    }
};

GedcomAnalytics.Utilities = {

    /**
     * Print informational messages according to log level
     * @param {String} msg
     * @returns {undefined}
     */
    printInfo : function(msg) {
        GedcomAnalytics.printBase(msg, GedcomAnalytics.GedcomSettings.logEnum.INFO);
    },
    
    /**
     * Print warning messages according to log level
     * @param {String} msg
     * @returns {undefined}
     */
    printWarn : function(msg) {
        GedcomAnalytics.printBase(msg, GedcomAnalytics.GedcomSettings.logEnum.WARN);
    },
    
    /**
     * Print error messages according to log level
     * @param {String} msg
     * @returns {undefined}
     */
    printErr : function(msg) {
        GedcomAnalytics.printBase(msg, GedcomAnalytics.GedcomSettings.logEnum.ERR);
    }
};

