"use strict";
var _ = require('underscore-node');
var errorHandler = require('../errorHandler').handleError;
var q = require('q');
var parseReceiptService = require('../services/parseReceiptService');
const fileUpload = require('express-fileupload');
const ObjectID = require('mongodb').ObjectID;
// Load the SDK and UUID
var AWS = require('aws-sdk');
var fs = require('fs');

// Create an S3 client
// var s3 = new AWS.S3();

var ListController = {
    getAll: (req, res, next) => {
        var query = req.db.collection('users');
        q.nfcall(query.find.bind(query, {username: req.params.username}))
            .then((results) => {
                return results.toArray();
            })
            .then((results) => {
                res.status(200).send(results);
            })
            .catch((err) => {
                errorHandler(err);
                res.sendStatus(err.status || 500);
            });
    },

    getList: (req, res, next) => {
        var query = req.db.collection('users');
        q.nfcall(query.find.bind(query, {username: req.params.username}))
            .then((results) => {
                return results.toArray();
            })
            .then((results) => {
                var lists = results[0] && results[0].lists ? results[0].lists : [];
                var list = _.filter(lists, (aList) => {
                    return aList.listId && aList.listId.toString() === req.params.listId;
                });
                res.status(200).send(list);
            })
            .catch((err) => {
                errorHandler(err);
                res.sendStatus(err.status || 500);
            });
    },

    getListByName: (req, res, next) => {
        var query = req.db.collection('users');
        q.nfcall(query.find.bind(query, {username: req.params.username}))
            .then((results) => {
                return results.toArray();
            })
            .then((results) => {
                var list = results[0] && results[0].lists ?
                    _.filter(results[0].lists, (aList) => {
                    return aList.listName === req.params.listName;
                }) : [];
                res.status(200).send(list);
            })
            .catch((err) => {
                errorHandler(err);
                res.sendStatus(err.status || 500);
            });
    },

    /**
     * /:username/:listId/update
     * @param req req.db, req.body.listName, req.body.items req.params.username, req.params.listId
     * @param res
     * @param next
     */

    update: (req, res, next) => {
        var query = req.db.collection('users');
        var list = req.body.list;
        var updatedList = [];
        q.nfcall(query.findOne.bind(query, {username: req.params.username}))
            .then((results) => {
                var lists = _.map(results.lists, (aList) => {
                    if(aList.listId && aList.listId.toString() === req.params.listId){
                        aList.items = list.items;
                        updatedList = aList;
                    }
                    return aList;
                });
                return query.updateOne({username: req.params.username},
                    { $set: {lists: lists} });
            })
            .then((results) => {
                res.status(200).send(updatedList);
            })
            .catch((err)=>{
                errorHandler(err);
                res.send(err.status || 500);
            });
    },

    createList: (req, res, next) => {
        var list = req.body.list;
        var query = req.db.collection('users');
        list.listId = new ObjectID();
        q.nfcall(query.findOneAndUpdate.bind(query,
                {username: req.params.username}, {$push: {lists: list} }) )
            .then((results) => {
                req.params.listName = list.listName;
               return module.exports.getListByName(req, res, next);
            })
            .catch((err) => {
                errorHandler(err);
                res.sendStatus(err.status || 500);
            });
    },

    eraseList: (req, res, next) => {
        var query = req.db.collection('users');
        q.nfcall(query.findOne.bind(query, {username: req.params.username}))
            .then((results) => {
                var lists = _.reject(results.lists, (aList) => {
                    return aList.listId && aList.listId.toString() === req.params.listId;
                });
                return query.updateOne({username: req.params.username},
                    { $set: {lists: lists} });
            })
            .then((results) => {
                res.status(200).send();
            })
            .catch((err)=>{
                errorHandler(err);
                res.send(err.status || 500);
            });
    },

    uploadReceipt: (req, res, next) => {
        //put picture somewhere, then send url to parseReceiptService
        if (!req.files) return res.status(400).send('No files were uploaded.');

        // The name of the input field (i.e. "receiptFile") is used to retrieve the uploaded file
        let receiptFile = req.files.receiptFile;
        let location = __dirname + '/receiptImages/temp.jpg';
        let url = 'https://s3-us-west-1.amazonaws.com/shop-smart/alwaysUseSameKey';
        // Use the mv() method to place the file somewhere on server

        q.nfcall(receiptFile.mv.bind(receiptFile, location))
            //before step below need to send to parsereceiptservice and then parse and then
            //hit update endpoint
            .then(() => {
                return fs.createReadStream(location);
            })
            .then((stream) => {
                var params = {Bucket: 'shop-smart', Key: 'alwaysUseSameKey', Body: stream, ContentType: 'image/jpeg'};
                var upload = new AWS.S3.ManagedUpload({params: params});
                return upload.send();
            })
            .then(parseReceiptService.readReceipt.bind(parseReceiptService, url, req, res, next))
            // .then(() => {
            //     res.status(200).send('File uploaded!');//TODO will call `update` endpoint above with formatted items list when parsereceiptservice done
            // })
            .catch((err) => {
                errorHandler(err);
                res.status(err.status || 500).send(err);
            });

    }
};

module.exports = ListController;