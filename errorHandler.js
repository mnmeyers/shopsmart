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