
function addRoutes(server) {
    server.addRoute({
        method : 'GET'
        , path : '/{path*}'
        , config : {
            handler : {
                'directory' : {
                    path : '../static/'
                    , index : true
                    , listing : false
                    , redirectToSlash : true
                }
            }
        }
    });

    server.addRoute({
        method : 'GET'
        , path : '/bower_components/{path*}'
        , config : {
            handler : {
                directory : {
                    path : '../bower_components/'
                    , index : false
                    , listing : false
                    , redirectToSlash : false
                }
            }
        }
    })
}


exports.addRoutes = addRoutes;
