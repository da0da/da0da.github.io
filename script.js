const inputElement = document.getElementById("gbxFile");
const resultsElement = document.getElementById("results");
const statusElement = document.getElementById("status");

inputElement.addEventListener("change", handleFile, false);

function handleFile() {
    const file = this.files[0];
    let parts = file.name.split(".");
    let extension = parts[parts.length - 1];
    if (extension !== "gbx") {
        statusElement.innerHTML = "Invalid file type";
        return;
    }

    if(file.size > 10 * 1024 * 1024) {
        statusElement.innerHTML = "File too big (10 mb limit)";
        return;
    }

    let formData = new FormData();
    statusElement.innerHTML = "Uploading...";
    formData.append("file", file);
    fetch('http://89.208.105.83:8080/api/gbx', {method: "POST", body: formData})
    .then((response) => response.json())
    .then((data) => {
        addRun(data);
        statusElement.innerHTML = "Done";
    })
    .catch(response => {
        statusElement.innerHTML = "Failed";
    });
}
let results = {};

function addRunCard(data, table) {
        let runCard = document.createElement("div");
        runCard.className = "runCard";
        let nickName = parse_tm_text(data['nickName']);
        let respawns = data['respawns'];
        let cps = data['cpTimes'];
        let header = table.getElementsByTagName("tr")[0];
        header.innerHTML = header.innerHTML + "<td>" + nickName + "</td>";

        if (table.getElementsByTagName("tr").length === 1) {
            for (let i = 0; i < cps.length; i++) {
                let cpRow = document.createElement("tr");
                let cpNameCell = document.createElement("td");
                cpRow.append(cpNameCell)
                if (i === cps.length-1){
                    cpNameCell.innerHTML = "Finish";
                }else{
                    cpNameCell.innerHTML = `CP${i+1}`;
                }
                table.append(cpRow);
            }
            let resultRow = document.createElement("tr");
            table.append(resultRow);
            resultRow.innerHTML = "<td>Respawns</td>";
        }


        for (let i = 0; i < cps.length; i++) {
            let rows = table.getElementsByTagName("tr");
            let cpNameCell = document.createElement("td");
            rows[i+1].append(cpNameCell)
            cpNameCell.innerHTML = cps[i];
        }
        let resultCell = document.createElement("td");
        resultCell.innerHTML = `${respawns}`;
        table.getElementsByTagName("tr")[table.getElementsByTagName("tr").length-1].append(resultCell);

        let timeRows = table.getElementsByTagName("tr");
        for (let i = 1; i < cps.length + 2; i++) {
            let timeCells = timeRows[i].getElementsByTagName("td");
            if (timeCells.length === 1) {
                timeCells[i].style = "color: green;"
                continue;
            }
            let fastestTime = "999999:59:59.99";
            for (let j = 1; j < timeCells.length; j++) {
                if (timeCells[j].innerHTML < fastestTime) {
                    fastestTime = timeCells[j].innerHTML;
                }
            }
            for (let j = 1; j < timeCells.length; j++) {
                if (timeCells[j].innerHTML === fastestTime) {
                    timeCells[j].style = "color: green;"
                } else {
                    timeCells[j].style = "color: red;"
                }
            }
        }

}

function addRun(data) {
    const resultsElement = document.getElementById("results");
    if (!results[data['mapUid']]) {
        let mapCard = document.createElement("div");
        let lineElement = document.createElement("hr");
        resultsElement.append(lineElement);
        resultsElement.append(mapCard)
        results[data['mapUid']] = mapCard;
        mapCard.className = "mapCard";
        let mapName = document.createElement("p");

        mapName.innerHTML = parse_tm_text(data['mapName']);
        mapCard.append(mapName);

        let tableElement = document.createElement("table");
        tableElement.innerHTML = "<tr><td>CP\\nickname</td></tr>";
        mapCard.append(tableElement);
        mapCard.table = tableElement;
    }
    addRunCard(data, results[data['mapUid']].table);
}


function clearAll() {
    resultsElement.innerHTML = "";
    results = {};
}


const styleMap = {
    o: "font-weight: bold;",
    i: "font-style: italic;",
    w: "font-stretch: wider;",
    n: "font-stretch: narrower;",
    s: "text-shadow: 1px 1px 2px black;",
    g: "",
    z: ""
};

function parse_tm_text(text) {
    let output = "";
    let current_styles = [];
    let current_color = "#000";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === "$" && styleMap[text[i + 1]]) {
            current_styles.push(text[i + 1]);
            if (text[i + 1] === "z") {
                current_styles = [];
            }
            if (text[i + 1] === "g") {
                current_color = null;
            }
            i++
            continue;
        } else if (char === "$" && text[i + 1] !== "$" &&
            (text[i + 1] <= "f" && text[i + 1] >= "0") &&
            (text[i + 2] <= "f" && text[i + 2] >= "0") &&
            (text[i + 3] <= "f" && text[i + 3] >= "0")) {
            current_color = "#" + text[i + 1] + text[i + 2] + text[i + 3];
            i += 3;
            continue;
        } else if (char === "$" && text[i + 1] === "$") {
            i++;
        }
        let styles = "";
        for (let j = 0; j < current_styles.length; j++) {
            styles += styleMap[current_styles[j]];
        }
        output += `<span style="color: ${current_color};${styles}">${char}</span>`;
    }

    return `<p>${output}</p>`;
}

