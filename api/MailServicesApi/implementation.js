/* eslint-disable object-shorthand */

"use strict";

// Using a closure to not leak anything but the API to the outside world.
(function (exports) {
    const { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
    const { MailServices } = ChromeUtils.import("resource:///modules/MailServices.jsm");

    // This is the important part. It implements the functions and events defined
    // in the schema.json. The name must match what you've been using so far,
    // "ExampleAPI" in this case.
    class MailServicesApi extends ExtensionCommon.ExtensionAPI {
        getAPI(context) {
            return {
                // Again, this key must have the same name.
                MailServicesApi: {

                    // A function.
                    parseEncodedHeaderW: async function (header) {
                        const parsedHeader = MailServices.headerParser.parseEncodedHeaderW(header);
                        return JSON.parse(JSON.stringify(parsedHeader));
                    },
                },
            };
        }
    }

    // Export the api by assigning in to the exports parameter of the anonymous closure
    // function, which is the global this.
    exports.MailServicesApi = MailServicesApi;

})(this)
