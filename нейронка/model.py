import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import numpy as np
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow.keras.datasets import mnist
from tensorflow.keras.layers import Dense, Flatten


def f_to_categorical(y, num_classes):
    m = y.shape[0]  #размерность массива (это будет вектор)
    categorical = np.zeros((m, num_classes))  #сам вектор

    categorical[np.arange(m), y] = 1    #определение категории

    return categorical



(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train = np.expand_dims(x_train, axis=-1)
x_test = np.expand_dims(x_test, axis=-1)


x_train = x_train / 255
x_test = x_test / 255       #нормализовали


y_train_cat = keras.utils.to_categorical(y_train, 10)
y_test_cat = keras.utils.to_categorical(y_test, 10)     #разделили в векторы по категориям


model = keras.Sequential([
    Flatten(input_shape=(28, 28, 1)),
    Dense(128, activation='relu'),#скрытый слой
    Dense(10, activation='softmax')#выходной слой
])

print(model.summary())      # вывод структуры НС в консоль

model.compile(optimizer='adam',
             loss='categorical_crossentropy',
             metrics=['accuracy'])  #компиляция + функция потерь + метрика


model.fit(x_train, y_train_cat, batch_size=32, epochs=10, validation_split=0.2)  #запуск обучения

#model.save("model.h5")  #сохранение модели
model.save("model.keras")  #не устаревшее (в выводе рекомендуют это)

model.evaluate(x_test, y_test_cat)     #с тестовой выборкой

