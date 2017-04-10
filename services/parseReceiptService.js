'use strict';
var algorithmiaKey = require('../secrets').algorithmia_key;
var algorithmia = require('algorithmia');
var client = algorithmia.client(algorithmiaKey);
var errorHandler = require('../errorHandler').handleError;
var List = require('../models/List');
var q = require('q');
const OCR_ALGO = 'algo://ocr/RecognizeCharacters/0.3.0';

var receiptService = {
    readReceipt: (imageLocation, req, res, next) => {
        client.algo(OCR_ALGO)
            .pipe(imageLocation)
            .then((response) => {
                if(response.error){//TODO currently algorithmia alg not working bc AWS bucket read permissions not set to public
                    errorHandler(response.error);
                    return res.status(500).send(response.error);
                }
                module.exports.parseResults(response.get(), req, res, next);
            });
    },

    parseResults: (results, req, res, next) => {
        console.log(`ocr results: ${results}`);
        res.status(200).send('File uploaded!');
        //take out certain characters, separate by newlines,
        //put in the proper format of list items (use model)
        //call lists.update to save to db and send back to client
        var list = new List();//fill this out
    }
};

module.exports = receiptService;