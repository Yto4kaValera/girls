from flask import Flask, request, jsonify
from PIL import Image
import numpy as np

app = Flask(__name__)

@app.route("/")
def index():
    return open("index.html", encoding="utf-8").read()

@app.route("/predict", methods=["POST"])
def predict():
    print("Получены файлы:", request.files) #проверка

    if "image" not in request.files: #проверка
        print("Ошибка: Файл не найден")
        return jsonify({"error": "Файл не найден"}), 400

    file = request.files["image"]
    
    try:
        image = Image.open(file).convert("L")  #в ЧБ (на всякий)
        print("Изображение открыто успешно")  #проверка

        image = image.resize((50, 50))
        print("Изображение изменено")  #проверка

        image_array = np.array(image) / 255.0
        print("Изображение преобразовано в массив")  #проверка


        #заглушка (то вместо чего должна выводить нейронка)
        prediction = 88
        print("Отправляю JSON:", {"prediction": prediction})  #лог

        return jsonify({"prediction": prediction})  #отправка угаданного числа
    
    except Exception as e:  #перехват ошибок в блоке try
        print("Ошибка при обработке изображения:", str(e))
        return jsonify({"error": "Ошибка при обработке изображения"}), 500

if __name__ == "__main__":
    app.run(debug=True)
