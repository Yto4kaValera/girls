const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;   //��������� ������ ��

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = "black";
ctx.lineWidth = 20;
ctx.lineCap = "round";

function startPosition(e) {
    drawing = true;
    draw(e);
}//������ �������

function endPosition() {
    drawing = false;
    ctx.beginPath();
}//����� �������

function draw(e) {
    if (!drawing) return;

    ctx.lineTo(e.offsetX, e.offsetY);   //����� �� ���������� (������� ������) offsetX �� offsetY
    ctx.stroke();   //���������� ��� �����
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY); //����� ���������� �� ������� ����� ������� �����
}

canvas.addEventListener("mousedown", startPosition);    //������ -> ������ �������
canvas.addEventListener("mouseup", endPosition);  //������� -> ����� �������
canvas.addEventListener("mousemove", draw); //��������� -> ������ ������


function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("result").innerText = "";
}   //������� ��� ������� � ���������


function sendImage() {
    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = 50;
    smallCanvas.height = 50;
    const smallCtx = smallCanvas.getContext("2d");

    //��������� ������ ������
    smallCtx.drawImage(canvas, 0, 0, 50, 50);

    smallCanvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append("image", blob, "digit.png");  //����������� �����������


        console.log("������������ ����:", formData.get("image"));   //���

        fetch("/predict", {
            method: "POST",
            body: formData,  //�������� FormData � ������
        })
            .then(response => response.json())
            .then(data => {
                console.log("����� �� �������:", data); //���
                document.getElementById("result").innerText = "� �����, ��� ��� " + (data.prediction || "������");
            })
            .catch(error => console.error("������ ��� ��������:", error));
    }, "image/png");
}
