FROM python:3.9

WORKDIR /app

COPY requirements.txt .
COPY app.py .
RUN pip install -r requirements.txt
RUN python -m spacy download en_core_web_sm

EXPOSE 5000
CMD ["uvicorn", "--host", "0.0.0.0", "--port", "5000", "app:app"]

# This Dockerfile sets up a Python environment for an NLP service using Gunicorn as the WSGI server.
# It installs the required packages from requirements.txt, copies the application code into the container, 
# and starts the application on port 5000.
# Make sure to have a requirements.txt file in the same directory with necessary dependencies.
# Example requirements.txt content:
# flask
# gunicorn
# transformers
# torch
# nltk
# Note: Adjust the Python version and dependencies as needed for your specific application.
