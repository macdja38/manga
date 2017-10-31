//get info for selected manga
//TODO: add client-side validation
//TODO: add loading screen while backend does its thing


var getInfo = function() {
    document.getElementById("selectAll").checked = false;
    var name;
    document.getElementsByName("manga").forEach(x => {if (x.checked) name = x.value});
    var r = new XMLHttpRequest();
    r.onreadystatechange = function () {
        if (r.readyState === XMLHttpRequest.DONE) {
            var result = JSON.parse(r.responseText);
            var info = result.info;
            var chapters = result.chapters;

            var img = document.createElement("img");
            img.src = info.image;
            img.alt = info.title + " cover image";
            img.class = "cover";
            Array.from(document.getElementById("imageContainer").childNodes).forEach(x => x.parentNode.removeChild(x));
            document.getElementById("imageContainer").appendChild(img);

            document.getElementById("mangaTitle").innerText = info.title;

            var list = "";
            info.genres.forEach(x => {
                list += x + ", ";
            });
            list.replace("/(\,\ )|(\,)$/", "");
            document.getElementById("genres").innerText = list;

            document.getElementById("downloadSite").value = document.getElementById("site").value;
            document.getElementById("downloadName").value = info.title;

            document.getElementById("mangaDescription").innerText = info.synopsis;

            Array.from(document.getElementById("chapterList").childNodes).forEach(x => x.parentNode.removeChild(x));

            chapters.sort((x, y) => {return x.chap_number - y.chap_number});
            chapters.forEach(x => {
                var li = document.createElement("li");
                li.class = "chapter";

                var chk = document.createElement("input");
                chk.type = "checkbox";
                chk.id = x.chap_number;
                chk.value = x.chap_number;
                chk.name = "chapter";

                var lbl = document.createElement("label");
                lbl.htmlFor = x.chap_number;
                lbl.innerText = x.chap_number + " - " + x.name;

                for (x of [chk, lbl])
                    li.appendChild(x);
                document.getElementById("chapterList").appendChild(li);
            });
        }
    };
    r.open("GET", "/info?name=" + encodeURIComponent(name) + "&site=" + encodeURIComponent(document.getElementById("site").value), true);
    r.send();
};

//Search for manga

var search = function() {
    var r = new XMLHttpRequest();
    r.onreadystatechange = function () {
        if (r.readyState === XMLHttpRequest.DONE) {
            if (r.status === 200) {
                Array.from(document.getElementsByClassName("result")).forEach(x => x.parentNode.removeChild(x));

                var results = JSON.parse(r.responseText);

                for (result of results) {
                    var tr = document.createElement("tr");
                    var td = document.createElement("td");
                    var chk = document.createElement("input");
                    chk.type = "radio";
                    chk.name = "manga";
                    chk.value = result.name;
                    chk.id = result.name;
                    chk.addEventListener('click', getInfo);
                    var lbl = document.createElement("label");
                    lbl.htmlFor = result.name;
                    lbl.innerText = result.name;
                    tr.classList.add("result");

                    for (x of [chk, lbl])
                        td.appendChild(x);
                    tr.appendChild(td);

                    document.getElementById("results").appendChild(tr);
                }
            }
        }
    };
    r.open('GET', "/search?site=" + encodeURIComponent(document.getElementById('site').value) + "&searchText=" + encodeURIComponent(document.getElementById('searchText').value), true);
    r.send();
};

document.getElementById('searchButton').addEventListener('click', search);
document.getElementById('searchText').addEventListener('keydown', e => {
    if (e.which === 13) search();
});
document.getElementById('site').addEventListener('change', search);

document.getElementById("selectAll").addEventListener('click', function() {
    document.getElementsByName("chapter").forEach(x => x.checked = document.getElementById("selectAll").checked);
});