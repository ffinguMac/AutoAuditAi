from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# 기본 MongoDB 클라이언트 설정
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "audit_ai"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    client.admin.command("ping")  # 연결 확인
    print("[MongoDB] 연결 성공")
except ConnectionFailure as e:
    print(f"[MongoDB] 연결 실패: {e}")
    client = None


def get_db():
    if client:
        return client[DB_NAME]
    else:
        raise RuntimeError("MongoDB에 연결할 수 없습니다.")


# db는 get_db()로 얻은 데이터베이스 객체입니다.
def create_collection(collection_name):
    db = get_db()
    if collection_name in db.list_collection_names():
        print(f"{collection_name} 컬렉션이 이미 존재합니다.")
    else:
        db.create_collection(collection_name)
        print(f"{collection_name} 컬렉션이 생성되었습니다.")


def insert_document(collection_name, document):
    db = get_db()
    result = db[collection_name].insert_one(document)
    print(f"도큐먼트가 삽입되었습니다. _id: {result.inserted_id}")


def find_documents(collection_name, query=None):
    db = get_db()
    if query is None:
        query = {}
    documents = list(db[collection_name].find(query))
    return documents


def delete_collection(collection_name):
    db = get_db()
    if collection_name in db.list_collection_names():
        db.drop_collection(collection_name)
        print(f"{collection_name} 컬렉션이 삭제되었습니다.")
    else:
        print(f"{collection_name} 컬렉션이 존재하지 않습니다.")


def get_collection(collection_name):
    db = get_db()
    if collection_name in db.list_collection_names():
        return db[collection_name]
    else:
        raise ValueError(f"{collection_name} 컬렉션이 존재하지 않습니다.")
