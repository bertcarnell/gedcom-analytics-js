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

GedcomAnalytics.Settings = {
    
    /**
     * The type of log messages to be printed
     * @type Enum
     */
    logEnum : {
        INFO : 0,
        WARN : 1,
        ERR : 2
    },
    
    /**
     * The level of log messages printed
     * @type Number
     */
    logLevel : 0
};
