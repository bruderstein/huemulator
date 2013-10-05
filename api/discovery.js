var dgram = require('dgram');

var discoveryResponse = '<?xml version="1.0"?>\
    <root xmlns="urn:schemas-upnp-org:device-1-0">\
        <specVersion>\
            <major>1</major>\
            <minor>0</minor>\
        </specVersion>\
        <URLBase>http://192.168.8.10/</URLBase>\
        <device>\
            <deviceType>urn:schemas-upnp-org:device:Basic:1</deviceType>\
            <friendlyName>Philips hue Bridge Router</friendlyName>\
            <manufacturer>Sagen</manufacturer>\
            <manufacturerURL>http://github.com/sagen</manufacturerURL>\
            <modelDescription>Philips hue Personal Wireless Lighting Bridge Router</modelDescription>\
            <modelName>Philips hue bridge 2012 Router</modelName>\
            <modelNumber>929000226503</modelNumber>\
            <modelURL>http://www.meethue.com</modelURL>\
            <serialNumber>nope</serialNumber>\
            <UDN>uuid:2f402f80-da50-11e1-9b23-nydalenlys</UDN>\
            <serviceList>\
                <service>\
                    <serviceType>(null)</serviceType>\
                    <serviceId>(null)</serviceId>\
                    <controlURL>(null)</controlURL>\
                    <eventSubURL>(null)</eventSubURL>\
                    <SCPDURL>(null)</SCPDURL>\
                </service>\
            </serviceList>\
            <presentationURL>index.html</presentationURL>\
            <iconList>\
                <icon>\
                    <mimetype>image/png</mimetype>\
                    <height>48</height>\
                    <width>48</width>\
                    <depth>24</depth>\
                    <url>hue_logo_0.png</url>\
                </icon>\
                <icon>\
                    <mimetype>image/png</mimetype>\
                    <height>120</height>\
                    <width>120</width>\
                    <depth>24</depth>\
                    <url>hue_logo_3.png</url>\
                </icon>\
            </iconList>\
        </device>\
    </root>';

exports.addRoutes = function(server) {
};
exports.enableDiscovery = function() {

    var s = dgram.createSocket('udp4');
    s.bind(1900, undefined, function() {
        console.log('UPnP discovery started')
        s.addMembership('239.255.255.250');
        s.on('message', function(msg, rinfo) {
            var msgString = msg.toString();
            if (msgString.substr(0, 10) == 'M-SEARCH *') {
                console.log('M-SEARCH Message received')
                console.log(rinfo);
                var response = "HTTP/1.1 200 OK\r\n\
CACHE-CONTROL: max-age=100\r\n\
EXT:\r\n\
LOCATION: http://192.168.8.10:80/description.xml\r\n\
SERVER: FreeRTOS/6.0.5, UPnP/1.0, IpBridge/0.1\r\n\
ST: upnp:rootdevice\r\n\
USN: uuid:2fa00080-d000-11e1-9b23-001f80007bbe::upnp:rootdevice\r\n";
                var responseBuffer = new Buffer(response);
                s.send(responseBuffer, 0, responseBuffer.length, rinfo.port, rinfo.address);
            }
        })
    });

    var server = require('hapi').createServer('0.0.0.0', 1902);
    server.route( {
        method: 'GET'
        , path: '/description.xml'
        , handler: function(request) {
            request.reply(discoveryResponse)
                .header('Content-Type', 'text/xml');
        }});
    server.start();

};