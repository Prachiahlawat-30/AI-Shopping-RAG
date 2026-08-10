from qdrant_client import QdrantClient
import traceback

URL = "https://ff908369-3a8d-49f9-89b8-02e2f3df2746.eu-west-1-0.aws.cloud.qdrant.io"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOlt7ImNvbGxlY3Rpb24iOiJwcm9kdWN0cyIsImFjY2VzcyI6InJ3In1dLCJzdWJqZWN0IjoiYXBpLWtleTo2MGU5YWUzYS01OWY3LTRjOTMtOWEzNS05MDFhNWM4YWNkNGMifQ.tu3U_vjZCYyVOadyG-BaX2bZmZVUIUqGfoHBLmqbyRk"

client = QdrantClient(
    url=URL,
    api_key=API_KEY,
)

try:
    collections = client.get_collections()
    print("SUCCESS!")
    print(collections)
except Exception:
    traceback.print_exc()
    
    
    
from app.services.embedding import embedding_service

results = embedding_service.search("wireless headphones")

print(results)