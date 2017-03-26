"use strict";
var _ = require('underscore-node');
var errorHandler = require('../errorHandler').handleError;
var q = require('q');
var parseReceiptService = require('../services/parseReceiptService');
const fileUpload = require('express-fileupload');
const ObjectID = require('mongodb').ObjectID;

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
                res.sendStatus(500);
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
                res.sendStatus(500);
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
                res.sendStatus(500);
            });
    },

    /**
     * /:username/:listId/update
     * @param req req.body.listName, req.body.items req.params.username, req.params.listId
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
                res.send(500);
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
                res.sendStatus(500);
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
                res.send(500);
            });
    },

    uploadReceipt: (req, res, next) => {
        //put picture somewhere, then send url to parseReceiptService

    }
};

module.exports = ListController;