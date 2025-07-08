FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
EXPOSE 5000
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
