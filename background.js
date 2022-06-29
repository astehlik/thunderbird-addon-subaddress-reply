function escapeRegExp(string) {
    // Source: https://stackoverflow.com/a/6969486
    // $& means the whole matched string
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildNewFrom(address, name) {
    if (!name) {
        return address;
    }
    return name + " <" + address + ">";
}

async function extractAddressPartsFromHeader(header) {
    const addresses = await emailAddresses.parseAddressList(header);
    if (!addresses.length) {
        return null;
    }
    return addresses[0];
}

async function extractRecipientMailAddresses(message) {
    const allRecipients = [
        ...message.recipients,
        ...message.ccList,
        ...message.bccList
    ];
    const allMailAddresses = []
    for (let recipient of allRecipients) {
        const addressParts = await extractAddressPartsFromHeader(recipient);
        if (!addressParts || !addressParts.address) {
            return;
        }
        allMailAddresses.push(addressParts.address);
    }
    return allMailAddresses;
}


function detectSubaddress(identityMail, relatedRecipients) {
    const identityMailParts = identityMail.split('@');
    const identityMailUser = escapeRegExp(identityMailParts[0]);
    const identityMailDomain = escapeRegExp(identityMailParts[1]);
    const subaddressRegex = new RegExp(identityMailUser + "[\-+].+@" + identityMailDomain, "i");

    return relatedRecipients.find((possibleSubaddress) => {
        return possibleSubaddress.match(subaddressRegex);
    });
}

async function handleTabCreation(tab) {
    if (tab.type !== 'messageCompose') {
        return;
    }

    const composeDetails = await messenger.compose.getComposeDetails(tab.id);
    if (composeDetails.type !== "reply") {
        return;
    }
    if (!composeDetails.relatedMessageId) {
        return;
    }

    const originalFrom = await extractAddressPartsFromHeader(composeDetails.from);
    if (!originalFrom || !originalFrom.address) {
        return;
    }

    const relatedMessage = await messenger.messages.get(composeDetails.relatedMessageId);
    if (!relatedMessage) {
        return;
    }

    const relatedRecipients = await extractRecipientMailAddresses(relatedMessage);

    // If message was sent to original mail address we do not need to look for subaddresses.
    if (relatedRecipients.includes(originalFrom.address)) {
        return;
    }

    const matchingSubaddress = detectSubaddress(originalFrom.address, relatedRecipients);
    if (!matchingSubaddress) {
        return;
    }

    const newFrom = buildNewFrom(matchingSubaddress, originalFrom.name);
    messenger.compose.setComposeDetails(tab.id, {from: newFrom});
}

browser.tabs.onCreated.addListener(handleTabCreation);
