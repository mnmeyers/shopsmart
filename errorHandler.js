"use strict";

module.exports = {
    handleError: (err) =>{
        if(err){
            console.error(new Error(err));
        }
    }
};

// $.ajax({
//     url: '/adaLovelace/create',
//     type: 'POST',
//     data: JSON.stringify( {
//         list: {
//             listName: 'walgreens',
//             items: []
//         }
//     } ),
//     contentType: "application/json; charset=utf-8"
// })

// $.ajax({
//     url: '/adaLovelace/58cf69297208d8a6b22f2c5d/update',
//     type: 'POST',
//     data: JSON.stringify( {
//         list: {
//             listId: "58cf69297208d8a6b22f2c5d",
//             listName: 'walgreens',
//             items: ['balloons', 'sponges', 'doggie toy']
//         }
//     } ),
//     contentType: "application/json; charset=utf-8"
// })