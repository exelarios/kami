const blacklistWords = ["The", "Lord"];
const blacklistsuffix = ["-shi", "-Ka", "-kai"];

function parseNames(text) {
    var regex  = new RegExp("( |^)" + blacklistWords.join("|") + "( |$)", "g");
    let filtered = text.replace(/[^a-zA-ZōТŌāūо-\s]/g, "").replace(regex, "").replace(/^[\s+]/, "");
    filtered = filtered.split(" ");
    let retry = 0;
    let found = false;
    while(!found && retry < filtered.length) {
        if (filtered[retry] == "" || filtered[retry] == "-") {
            retry++;
        } else {
            found = true;
            let finalWord = filtered[retry];
            blacklistsuffix.map(suffix => {
                finalWord = finalWord.replace(suffix, "");
            })
            return finalWord;
        }
    }
}

module.exports = formatName;