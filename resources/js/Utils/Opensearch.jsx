import axios from 'axios';

const ELASTICSEARCH_URL = 'http://192.168.6.69:9200';  // Replace with your actual OpenSearch/Elasticsearch endpoint
const INDEX_NAME = 'places';  // Replace with your desired index name
/**
 * Index a list of documents into Elasticsearch.
 * @param {Array} documents - List of documents to index.
 */
export async function indexDataToElasticsearch(documents) {
    try {
        // Ensure the index exists or create it
        await createElasticsearchIndexIfNotExists();

        const bulkData = [];
        documents.forEach((doc) => {
            // Add a geo_point and timestamp
            const documentWithGeoPoint = {
                ...doc,
                location: { lat: doc.lat, lon: doc.lon }, // Adding the geo_point
                timestamp: new Date().toISOString(), // Add the current ISO timestamp
            };

            bulkData.push({ index: { _index: INDEX_NAME, _id: doc.id } });
            bulkData.push(documentWithGeoPoint);
        });

        const response = await axios.post(
            `${ELASTICSEARCH_URL}/_bulk`,
            bulkData.map((item) => JSON.stringify(item)).join('\n') + '\n',
            {
                headers: {
                    'Content-Type': 'application/x-ndjson',
                },
            }
        );

        if (response.status === 200) {
            console.log(`Successfully indexed ${documents.length} documents`);
        } else {
            console.error(`Error indexing data: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error indexing data to Elasticsearch:', error);
    }
}

/**
 * Create an Elasticsearch index if it doesn't exist.
 */
async function createElasticsearchIndexIfNotExists() {
    try {
        const response = await axios.head(`${ELASTICSEARCH_URL}/${INDEX_NAME}`);
        if (response.status === 404) {
            // Index does not exist, create it
            await axios.put(`${ELASTICSEARCH_URL}/${INDEX_NAME}`, {
                mappings: {
                    properties: {
                        id: { type: 'integer' },
                        location: { type: 'geo_point' }, // Create the geo_point field
                        tags: { type: 'object' },
                        timestamp: { type: 'date' },
                    },
                },
            });
            console.log(`Created Elasticsearch index: ${INDEX_NAME}`);
        }
    } catch (error) {
        console.error('Error checking/creating Elasticsearch index:', error);
    }
}
