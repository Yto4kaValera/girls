const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;   //проверяет рисуют ли

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = "black";
ctx.lineWidth = 20;
ctx.lineCap = "round";

function startPosition(e) {
    drawing = true;
    draw(e);
}//начало рисунка

function endPosition() {
    drawing = false;
    ctx.beginPath();
}//конец рисунка

function draw(e) {
    if (!drawing) return;

    ctx.lineTo(e.offsetX, e.offsetY);   //линия от координаты (зажатой мышкой) offsetX до offsetY
    ctx.stroke();   //отображает эту линию
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY); //новые координаты по которым можно строить линию
}

canvas.addEventListener("mousedown", startPosition);    //зажата -> начало рисунка
canvas.addEventListener("mouseup", endPosition);  //опущено -> конец рисунка
canvas.addEventListener("mousemove", draw); //двигается -> просто рисуют


function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("result").innerText = "";
}   //удаляет все пиксели и результат


function sendImage() {
    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = 50;
    smallCanvas.height = 50;
    const smallCtx = smallCanvas.getContext("2d");

    //уменьшает размер холста
    smallCtx.drawImage(canvas, 0, 0, 50, 50);

    smallCanvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append("image", blob, "digit.png");  //отправление изображения


        console.log("Отправляется файл:", formData.get("image"));   //лог

        fetch("/predict", {
            method: "POST",
            body: formData,  //передаем FormData с файлом
        })
            .then(response => response.json())
            .then(data => {
                console.log("Ответ от сервера:", data); //лог
                document.getElementById("result").innerText = "Я думаю, что это " + (data.prediction || "Ошибка");
            })
            .catch(error => console.error("Ошибка при отправке:", error));
    }, "image/png");
}
