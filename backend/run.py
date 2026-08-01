from app import create_app
from database import create_database
from flask_cors import CORS

app = create_app()

CORS(app, supports_credentials=True)

create_database(app)

if(__name__) == "__main__":
    app.run(debug = True)