import pandas as pd
from flask import Flask, request, render_template, send_from_directory
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from io import StringIO

app = Flask(__name__)
decision_tree = None
features = None
classes = None
encoders = {}
target_encoder = None

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

def get_html_tree():
    global decision_tree, features, encoders, target_encoder
    if decision_tree is None:
        return "<div class='tree-error'>Дерево не обучено</div>"
    
    tree = decision_tree.tree_
    feature_names = list(features)
    
    def build_node(node, depth=0):
        css_class = "tree-leaf" if tree.feature[node] == -2 else "tree-node"
        html = f"<div class='{css_class}' style='margin-left: {depth * 30}px'>"
        
        if tree.feature[node] != -2:
            name = feature_names[tree.feature[node]]
            threshold = tree.threshold[node]
            
            if name in encoders:
                classes = encoders[name].classes_
                threshold = int(threshold)
                value = classes[threshold] if threshold < len(classes) else "?"
                condition = f"{name} = {value}?"
            else:
                condition = f"{name} ≤ {threshold:.2f}?"
                
            html += f"<div class='node-condition'>{condition}</div>"
            html += build_node(tree.children_left[node], depth + 1)
            html += build_node(tree.children_right[node], depth + 1)
        else:
            class_idx = tree.value[node][0].argmax()
            class_name = target_encoder.inverse_transform([class_idx])[0]
            html += f"<div class='node-class'>→ {class_name}</div>"
            html += f"<div class='node-samples'>{tree.n_node_samples[node]} samples</div>"
        
        return html + "</div>"
    
    return "<div class='decision-tree'>" + build_node(0) + "</div>"

@app.route('/')
def home():
    return render_template('index.html', html_tree=get_html_tree())

@app.route('/train', methods=['POST'])
def train():
    global decision_tree, features, classes, encoders, target_encoder
    try:
        csv_text = request.form['csv_data']
        df = pd.read_csv(StringIO(csv_text))
        features = df.columns[:-1]
        X = df[features]
        y = df[df.columns[-1]]
        
        encoders = {}
        for col in X.select_dtypes(include=['object']).columns:
            encoders[col] = LabelEncoder()
            X[col] = encoders[col].fit_transform(X[col])
        
        target_encoder = LabelEncoder()
        y = target_encoder.fit_transform(y)
        
        decision_tree = DecisionTreeClassifier(max_depth=3)
        decision_tree.fit(X, y)
        
        return render_template('index.html', html_tree=get_html_tree())
    except Exception as e:
        return render_template('index.html', html_tree=f"<div class='error'>Ошибка: {str(e)}</div>")

@app.route('/predict', methods=['POST'])
def predict():
    global decision_tree, encoders, target_encoder
    try:
        if decision_tree is None:
            return render_template('index.html', html_tree="<div class='error'>Сначала обучите модель</div>")
            
        csv_text = request.form['csv_data']
        df = pd.read_csv(StringIO(csv_text))
        
        for col in df.select_dtypes(include=['object']).columns:
            if col in encoders:
                df[col] = encoders[col].transform(df[col])
        
        predictions = decision_tree.predict(df)
        decoded_predictions = target_encoder.inverse_transform(predictions)
        
        return render_template('index.html', 
                            html_tree=get_html_tree(),
                            prediction=str(decoded_predictions.tolist()))
    except Exception as e:
        return render_template('index.html', html_tree=f"<div class='error'>Ошибка: {str(e)}</div>")

if __name__ == '__main__':
    app.run(debug=True)