const SteamID = {
    toSteam64: function(steamid) {
        let steam64id = 76561197960265728n;
        let idSplit = steamid.split(":");
        steam64id += BigInt(idSplit[2]) * 2n;
        if (idSplit[1] === "1") {
            steam64id += 1n;
        }
        return steam64id;
    },

    fromSteam64: function(sid) {
        let y = BigInt(sid) - 76561197960265728n;
        let x = y % 2n;
        return `STEAM_0:${x}:${(y - x) / 2n}`;
    },

    fromAccountID: function(accountId) {
        accountId = BigInt(accountId);
        let y = accountId % 2n;
        let z = (accountId - y) / 2n;
        let legacy = `STEAM_0:${y}:${z}`;
        let steam64 = 76561197960265728n + accountId;
        return { legacy, steam64 };
    } 
};

module.exports = {
    SteamID
};
