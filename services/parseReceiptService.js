'use strict';
var algorithmiaKey = require('../secrets').algorithmia_key;
var algorithmia = require('algorithmia');
var client = algorithmia.client(algorithmiaKey);
var errorHandler = require('../errorHandler').handleError;
var List = require('../models/List');
const OCR_ALGO = 'algo://ocr/RecognizeCharacters/0.3.0';

var receiptService = {
    readReceipt: (imageLocation, req, res, next) => {
        var self = this;
        client.algo(OCR_ALGO)
            .pipe(imageLocation)
            .then((response) => {
                if(response.error) return errorHandler(response.error);
                self.parseResults(response.get(), req, res, next);
            });
    },

    parseResults: (results, next) => {
        console.log(`ocr results: ${results}`);
        //take out certain characters, separate by newlines, send back

        //...do stuff
        //put in the proper format of list items (use model)
        var list = new List();//fill this out
    }
};

module.exports = receiptService;