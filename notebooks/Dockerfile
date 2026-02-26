FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY engine/ ./engine/
COPY notebooks/ ./notebooks/

RUN addgroup --system jupyter && adduser --system --ingroup jupyter jupyter \
    && chown -R jupyter:jupyter /app

USER jupyter

EXPOSE 8888

CMD ["jupyter", "lab", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--notebook-dir=/app/notebooks"]
