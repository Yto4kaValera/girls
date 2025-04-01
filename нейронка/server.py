import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
from tensorflow.keras.models import load_model 
from PIL import ImageOps


#model = load_model("model.h5") #устаревшее
model = load_model("model.keras")

app = Flask(__name__)

@app.route("/")
def index():
    return open("index.html", encoding="utf-8").read()

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files: #проверка
        print("Ошибка: Файл не найден")
        return jsonify({"error": "Файл не найден"}), 400

    file = request.files["image"]
    
    try:
        image = Image.open(file)
        print("Картинка открыта успешно")
        print("Размерность:", image.size)


        image = image.convert("L")
        image = ImageOps.invert(image)
        print("Картинка изменена")


        #image.show()  #проверка какая картинка стала


        image_array = np.array(image, dtype=np.float32)     
        print("Картинка преобразована в массив")


        #image.show()  #тоже проверка

        image_array = image_array/255.0
        image_array = np.expand_dims(image_array, axis=0)  #batch размерность
        image_array = np.expand_dims(image_array, axis=-1)  #канал (28x28x1)

        print("Картинка подготовлена для нейронки")
        
        print("Форма входного массива в модель:", image_array.shape)    #должна быть 1 28 28 1
        print("Вес слоя модели:", model.get_weights()[0].shape)         #проверка правильно ли подгружена модель
        print("Мин. значение:", np.min(image_array), " Макс. значение:", np.max(image_array))   #вывод от 0 до 1


        prediction = model.predict(image_array)  #предсказание
        predicted_class = int(np.argmax(prediction)) 
        print("Отправляю JSON:", {"prediction": predicted_class})  #лог

        return jsonify({"prediction": predicted_class})  #отправка угаданного числа
    
    except Exception as e:  #перехват ошибок в блоке try
        print("Ошибка при обработке:", str(e))
        return jsonify({"error": "Ошибка при обработке"}), 500

if __name__ == "__main__":
    app.run(debug=True)
