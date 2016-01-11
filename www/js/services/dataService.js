﻿angular.module('sentdevs.services.dataService', [])
.factory('dataService', ['$http', '$q', function ($http, $q) {
    var eStatus = {
        FRIEND : 0,
        WAITING : 1,
        NOT_FRIEND: 2
    };
    var offersChangesSubscribers = {};
    var chatSubscribers = {};
    var offers = [{
        id: 1,
        owner: {
            name: 'James',
            surname: 'Bond',
            avatar: 'data:image/jpeg;base64,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'
        },
        time: '1:10',
        numOfPersons: 3,
        eaters: [],
        location: 'CasinoRoyal'
    },
     {
         id: 2,
         owner: {
             name: 'Angelina',
             surname: 'Jolie',
             avatar: 'data:image/jpeg;base64,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'
         },
         time: '2:15',
         numOfPersons: 3,
         eaters: [{
             name: 'Angelina',
             surname: 'Jolie',
             avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAGgApgMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAFAAMEBgcBAgj/xAA4EAACAQMCAwUFBwMFAQAAAAABAgMABBEFIRIxQQYTIlFhMnGBkaEHFEKxwdHwI+HxFTNScqJi/8QAGQEAAgMBAAAAAAAAAAAAAAAAAQIAAwQF/8QAIREAAgIDAAIDAQEAAAAAAAAAAAECEQMhMRJBIjJRYUL/2gAMAwEAAhEDEQA/APEh3ppicV6c714JqlkG8nNe8kDNeCSK7nw0CHoHBofr2qf6bYl1x3j+FBnr51NLcILHOwqga/dS6hfsqniVWKqB0xzx+9RDxVgS+uHuJi8jFmPWmFy2FFSbq37klWGDUYEg+GrlwEuh3S7GK51CGPCMcAY863PQrJbOwihjGMLyrLPs30eWS7S9mUd2eWeZrZ7ZVBUHGSNgay5ZW6NWJVGwjYLsM0VSMYzUC1XaiMecU8F+izPMkY4aG3MIIPFRVuVQLupMkXso3aXQ7a+DGWMcsA4rLr8ppU72zAMGJA4mIxW3XygoQ24NY19oVqiX7gHhLDiX3/zNJjfyofJ9bK3PZwSsWDlM74NctYZ4GaJWDQuOF0YcQwfTmOlR7G6CMBMxA64NFo73T2kCKj88capsT8Tmr3ooVMsXZfWcRLp18f6kZ4I5s5DDoD5Hb6VY85O1U+x0yLvZzxju5E4S4O6MN1JHyqyaVM1xZxvJs4GGA6Ecx8waS7Yko0EUJxSrymaVEQZkG5pljt609JjNMMAahBHLCuA4FdB2rzjLb0CEXVJDHb4Bw8nhU+XmfkDVe0qyzd98VGSuRnp5Ua17Ldwq9Q/L4D9aiSI0SCKH/cY8OfLAwKDL8fCo6/w/eX4N1BKr645mh6r3cLSEZLDA9PWiuqxxyTuUz3ER4E3zkDr+vxqFBZzXyzPGMpCBkZ6E/wBjVqdIWS2at2UUWmk2jMCcRLsOZ2FWf77rkQS5j0VJIF6iYNKAefhA2+tQtNsXGkoYUDMkYwpOAar0Ws9pJheXkCw21vayLGY53ZmJJwfZIwB5nPMVmjFyZpclFbNH0btZpd1IIJ5Da3PIxTDh399WhJVYbVmFpAmuxd7ex8TLN3cc2eKOU4BwrFQynf8AFz6VcNDklWL7vICGh8G/On8nF0xWoyVosDOtQ714Y4jJLIqKObMcChWuXVx3LW1oWWeTZSoyR61Qry0tbOYvr2piaRdzDcXLbepVRsPfQcvLVEUUttlpvdY02ZjDBeRPKRkKDzrJvtIc/e4LrpxFD8RV7trvR9TtpLe2sbI8I4uOAggEdQRg5FUT7R4zHYWoYknvsEnrsaWCrIhp14MpNtnvQRjOdzirTolvZyx440eQ58OMH4A0A0qFGLtLsFIJ9Bvn8qnvm2dVRufl+dXyKILRZrOBHvZ4reQFmiBJG2+SP0qT2ZmZ7WUPlSspBB+BP1oX2Zn726ac7O8YDH3E/vRLs/gC/bkGvHI+QpECf4HVeuU2rUqYpOS7E70znfnXZW8RpnO+9Ag6DXjjOa4WHSmuJicACoGhq6HHLFIx8KZz+f6ChM05WGSXkVTJPqdv3qVrF2kEXdnBkbkPj+1CDeCKZXbDCJu8IP4iq5H/AK4aXrNEVSB9+DEjjm3EQ49xO3zB+QqTptqbR7eCZ2Q3+4AGfZ9n55oW0rd7CpJPVs9eh+lTJb7i1qwfgaTueFURSQWOdhkeuKd8oF1s3fsjifTyG58qlydmbeS5e4j/AKbye1w9aAdh75mRklHDIx4mX/iTuRWhW5DqKqii6ba4DrfSIEiCTpHJGvJO7GB61ItUU3crL5DO1SbxhFayN5CoGiy8du0nVjTPtFatqzptxPPcHjZCfBxIcMo9PKq5r3Zn7wSY++xwCN0iYKJVBJwwHPmd6sFrLnU5Y/jRRkBG9SD1okl+mbWPY5pNcuNXu1W3MoAEERKg46nBqm/a8qRwWkacxMdvga2u9ZYo2JxXz/8AaFef6h2kgtx7MYLHfz/x9aEbcwy+g7qmjw6b96KgCNlVdvPhoHIQ0jZIyqHfoCT+xNWHtRcm4jZRkgyljj0/xQDumMMhLbcWWPn/ADf5U/8AQLRP0i4S1TvWbCDAO3Q8v0qw6BEY9MjL7tK7SHPqSf2qmh+90fCnd51Qb9Dyq2aBeCaxEMmFntv6cijoRt+lSqKsmwuDjkKVNK59KVQqPMnOm+eBXZWINN5JxUCen2xTJk4ASdh5+X83pxjk0I1uVhaSxo3iICj44H61Bl0rF/ftd3U02W4F9ke/lTAnLo++/C35iuX8LW91LCo2Pp5VHtiEfD7KdifTrT0h/JjitkoRzU4+AojpEPfdpNHRhnvLuBSPPLihQBhnKSjBRsMKtHZmJW7Sdn5JOX3yPf8A6vkH3bVHoi+SL12flNuttcJ7DqAcdK03Tp+KNTmsl7D3kd9pJh4hxwuyEZ6Z2+mK0TSJmWFR5CszfjJmlfKKDupI01lIkbYcjbNV/TL7VNPUxXNkZQXPAYvF8DXLztRapO1ujjvI/a4jjFdh7TWpjRhKCjDIO2/uqXbtBUJJcJWgC9nuZbq9tzAx2wSDn5Ucll4VoDZdoLWVlAZQG9lgdjUy5ugYi6nIqKVIWUHe0Ae1WpmOIxJuz9PSsXuGluu00vekOkHI4/B7X899aR2nuRBb3N7OciNCwJ8+lZlb3X9W6uH9qZ8eLbhQdD8h8jTY/bBk9IkatKxaOFDl23YnYADmT/OhqFeXIto5LWPdRECWPNiev1qLqF13nesp9rwk+mf8/OvGvEfe1ZTs0K/Q4q+MSmUhmCUiwdQdgyv7iMirXpwaLU2lVv8AfjV2Hmev5iqhGrfcZfCT3rqq48xmrtpsYkmMi+xGojXI5kc/rt8Kkiv0GkbbNKvKDalSCHZfappjgV6lbxU0zbYosI3NJwRu+NwKEX8DG172RiWVw7YG7b5qffE90QCTkEYry3drCrHxcWAo8yaUePCJe20eoxRrAqIQMCQ+tU25R7e7kicYZGIINWq3knMrrZjFtxEFmGwPXhyeVBNfjZb0yMMiQe0DkZFWR6GXCPbuJyqy4DKMIx5Ef8T+9S7tHi09FU57tyAV8tiCPnUW3jljt/vESgoNnRhkGpw4X02ea3XgCy+yOW6jz+NF9DHh3sjqs+n6unAeJZ9pFPX1rbuz+opcRjhPw6isE0hc6nAV6HNa/p8clukV7ANwPGo/GP3rNndSNOGPwZYrxGtrgzyQNLA5BZlXJT+1PwHQygeG6SIY34ZAD8qn6RqMF0ikEe40YYWcgw8ELHzZBUhwaU2tNFJNpp19OkVpapLCm5k4fDz+tE9QnitLPu1woAolqNxbWkTOeFFA6VjnbjtXc31wbLTCUDbNIegpKcnRJTtWDe3mvnUbgaZaHMUZzMw6nyqrySlUKLuqDLep6fLNSjFDbJ3MTM8rDidj+ZqFOFEZUbZAzWqKS0jM7e2eYIu+iZE3YqD9amhFuIsynfgGD5UxY5SZ4zgNjA9DmmAzNbMmSGi2Puz/AD50wqddCtraia8sYYCWgB4wSP51q2QKkRaOFQFUjGOWev5Cqho080k0US7hBwkZwVXrv76uIZI0XGMAbAUkrFlzQ8CQKVNRyB1zj60qAlDsvtNTJO2Kdl3LVBuZZEibuYWkYg4wcY2otpdDGLlw7K+JeA4wyjGfjn9KA30d2ZjPC/E0WwXrjzx1oXHd38l7/VZmlDYMZOB7sDlTuqLwEd20rcS7szDHu/zR8SyPDkV5eW0HCJowm5I5nf8AKhk7MZCzFiWOWz1rpkXG5JYHl0ryI2nYkeWSegFOkI2FrSRYdKlUYMjsAD5DqD9K8yotpb9wZsyT4Zol5J5ZPnvyofFcssXd8WMHIP6U/pmJdRjMjhfGCSSP12+dBjp3Qe0LQ2e/iMbliq8UnEuMHHLHTn8cVsGj2PDYiNx0oB2F0+NrZm4cNxktxczttn4dKvlrDw+HG1YJSc5WbqUI0itTaZNDcGS0do28xXqSfVol3lQn1WrX92BOcbU1NZKxyQNqDi/QFNezOO0t1dQ2bS3MzO5HInZfhWWXk8ocsQQzc61zt7bd4I4QPbkRPgTvWcdobBkmYBdwzDb30+CST2TLFuOiBpUQkaWV2GI1y7HqTsB8/wAqhOpYsv4hsffvUpkdIktxsXIIHmcc/lTPIiXmCeFvPNa12zI+UczxCKZPbxv7x/BSu0aKdbhB4Jc422B6ivMpMMoPNSc/GpoeFo2WZcQvz4ecbdDTiNWRI1YMJoGZSBgqD4l/cUZhvJr22UGYxoGAJAwcdfpQ1VWE9zMFZT7Ei/ip+zitkYRSsuXJ8T8qR7Gqtln06TiACPxIq4ODyPQfClXYu7QDDLgjbelSlb6G9H019UuTxAiFTv8A/VFu08dnpGmxhYFaedxDChHNj5+g512lWW/KWzcl4pJGV9oIJNI1WOSQmWVwS/EnCPgKF6jepcKvdrwDqDz/AL0qVbMW4Jsy5X4zaRCgi72ZY+ILxHGTyFSJYhEGRZFcdcUqVWMriKwsLi9lEMERdiQNumTVx0Hs4bW/sbxndDnDqrBeEnK+02QN+eRyPSuUqyZsslpGnFjVWXjs/P8Ac7tpFIKPKVYDkDn35Y43Jxgcqv8Abyo2D50qVZoPZfJaJ8QDZxSlVVFKlWn0Ueyh9obfv5ZJcZMTLIoxzKtmqr2itbd1WYkeLGB5/wA5UqVZF9kbP8lG1EqNYRQQUAJBz6E1AtQs0N5GRyyy+8f2FKlXSX1OfL7HiEmSM94pPCcE46/vUiGBZIwBLwSDbcbOKVKmYEQrhpIgYG9kHPAfw+6uQXDZVXAdc7q4z9a7SoiPTCVjZma6cBTGFXce0Nz0pUqVJYaP/9k='
         }],
         location: 'AlPachino'
     }];
    return {
        getPeople: function () {
            return [
                {
                    name: 'Žiga',
                    surname: 'Ajdnik',
                    status: eStatus.FRIEND,
                    picture: 'https://scontent-vie1-1.xx.fbcdn.net/hprofile-xat1/v/t1.0-1/p160x160/10616063_10201741780905426_7128050048956798732_n.jpg?oh=e8842f9b17d004c24cbc9ef006caeeae&oe=56D55124'
                },
                {
                    name: 'Marko',
                    surname: 'Deželak',
                    status: eStatus.FRIEND,
                    picture: 'https://scontent-vie1-1.xx.fbcdn.net/hprofile-frc3/v/t1.0-1/c46.47.579.579/s160x160/47055_131205306931574_6086166_n.jpg?oh=3fec7d406af034a94741970eed039832&oe=56E4F71D',
                },
                {
                    name: 'Carmen',
                    surname: 'Electra',
                    status: eStatus.FRIEND,
                    picture: 'https://scontent-vie1-1.xx.fbcdn.net/hprofile-xtp1/v/t1.0-1/c272.0.160.160/p160x160/12208819_10153596288811265_6759630954911669327_n.jpg?oh=0bdb8d9f6d57fd4b0933d3e528532192&oe=5712F2EA'
                },
                {
                    name: 'Angelina',
                    surname: 'Jolie',
                    status: eStatus.WAITING,
                    picture: 'https://external-vie1-1.xx.fbcdn.net/safe_image.php?d=AQB0kZh_Sj1LFFHN&w=264&h=264&url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F2%2F20%2FAngelina_Jolie_Cannes_2011.jpg&colorbox&f'
                }
            ];
        },
        /**
        * Adds new eater to offer with given id
        * @param {offer} Offer
        */
        updateOffer: function updateOffer(offer) {

            //simulate sockets.
            var eater = offer.eaters[offer.eaters.length - 1];
            this.onEaterAdded(offer.id, eater);
            var deferred = $q.defer();

            deferred.resolve();

            return deferred.promise;
        },
        /**
        * Get all offers
        * @returns {offers[]} All offers
        **/
        getOffers: function getOffers() {
            var deferred = $q.defer();
            
            deferred.resolve(offers);

            return deferred.promise;
        },
        /**
        * Add new offer
        * @param {offer} Offer
        **/
        addOffer: function(offer) {
            var deferred = $q.defer();
            offers.push(offer);
            deferred.resolve();

            return deferred.promise;
        },
        /**
        * Subscribe to offers changes
        **/
        subscribeToOffersChanges: function subscribeToOffersChanges(id, fnCallback){
            offersChangesSubscribers[id] = fnCallback;
        },
        /**
        * Listens for changes on server and notify offer subsriber
        **/
        onEaterAdded: function onEaterAdded(offerId, eater) {
            if (offersChangesSubscribers.hasOwnProperty(offerId) && offers[offerId]) {
                // Is save to call callback function
                offersChangesSubscribers[offerId](offerId, eater);
            }
        }
    };
}]);