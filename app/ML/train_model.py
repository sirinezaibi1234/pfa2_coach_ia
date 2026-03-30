import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# charger dataset
df = pd.read_csv("dataset.csv")

# features / target
X = df.drop("label", axis=1)
y = df["label"]

# split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# modèle
model = RandomForestClassifier()
model.fit(X_train, y_train)

# test
accuracy = model.score(X_test, y_test)
print("Accuracy:", accuracy)

# 🔥 IMPORTANT : sauvegarde
joblib.dump(model, "model.pkl")

print("Model saved!")