var os = require('os');

exports.getIpAddress = function() {
    var interfaces = os.networkInterfaces();
    var foundAddress = null;
    for (var interfaceKey in interfaces) {
        for (var addressIndex in interfaces[interfaceKey]) {
            var address = interfaces[interfaceKey][addressIndex]
            if (address.family == 'IPv4' && address.internal == false) {
                foundAddress = address.address;
                break;
            }
        }

        // break out if we've found an address, we only want the first one.
        if (foundAddress != null) {
            break;
        }
    }

    return foundAddress;
};


exports.getMacAddress = function(ipAddress) {
    // As far as we can tell, nothing should care about the MAC address of the bridge.
    // It shouldn't, but that sadly doesn't mean much.
    return '00:00:de:ad:c0:01';
}