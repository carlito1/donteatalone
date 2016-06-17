angular.module('sentdevs.services.chatService', [])
.factory('chatService', ['$q', 'principal', function ($q, principal) {
    var chats = [];
    var messages = [];
    function getSender( chatSnapshot ) {
        var senderId = chatSnapshot.child( 'sender' ).val();
        var fb = firebase.database();
        return fb.ref( 'peoples/' + senderId ).once( 'value' )
        .then( function ( personSnap ) {
            var personModel = {
                avatar: personSnap.child('avatar').val(),
                name: personSnap.child('name').val(),
                id: personSnap.key
            };
            return personModel;
        } ) ;
    }
    return {
        getChats: function getChats( fnCallback ) {
  
            var fb = firebase.database();
            principal.getIdentify()
            .then( function ( identity ) {
                fb.ref( 'members/' ).orderByChild( identity.id )
                .on( 'child_added', function( snapshot ){
                    chats = [];
                    fb.ref( 'chats/' + snapshot.key ).on( 'value', function( chatSnapshot ){
                        var chatModel = {
                            id: chatSnapshot.key,
                            header: chatSnapshot.child('header').val()
                        };
                        getSender( chatSnapshot ).then( function( person ){
                            chatModel.sender = person;
                            chats.push( chatModel );
                            fnCallback( chats );
                        } );

                    } );
                } ); 
            } )
        },

        getMessages: function( id, fnCallback ) {
            messages = [];
            var fb = firebase.database();
            fb.ref( 'messages/' + id )
            .on( 'child_added', function ( messageSnapshot ) {
                console.log( 'Kličem pridobivanje spoorčila');
                var messageModel = {
                    message: messageSnapshot.child( 'message' ).val()
                };
                getSender( messageSnapshot )
                .then( function( person ){
                    messageModel.sender = person;
                    messages.push( messageModel );
                    fnCallback( messages );
                } );
            } );
        },

        sendMessage: function( id, message ) {
            message.sender = message.sender.id;

            return $q.when( firebase.database().ref( 'messages/' + id ).push( message ),
                    firebase.database().ref( 'chats/' + id + '/header' ).set( message.message ),
                    firebase.database().ref( 'chats/' + id + '/lastMessage' ).set( message.sender ) );
        }
    };
}]);