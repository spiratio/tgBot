export enum Errors {
  MONGO_CONNECTION_ERROR = 'Failed to connect to MongoDB',
  MONGO_CLOSED_ERROR = 'Failed to close MongoDB connection',
  MONGO_INSERT_ERROR = 'The user insertion into MongoDB has failed',
  MONGO_FIND_ERROR = 'MongoDB error while finding data',
  MONGO_USER_NOT_FOUND_ERROR = 'User not found in MongoDB',
  MONGO_UPDATE_ERROR = 'Error updating document in MongoDB',
  MONGO_COLLECTION_ERROR = 'Error retrieving MongoDB collection',
  COORDINATES_NOT_FOUND = 'Coordinates not found',
  FAILED_TO_GET_COORDINATES = 'Failed to get coordinates'
}

export enum Messages {
  CONNECTED_TO_MONGODB = 'Connected to MongoDB',
  CONNECTION_CLOSED = 'Connection to MongoDB closed',
  USER_ADDED_TO_MONGO = 'User added to MongoDB',
}
