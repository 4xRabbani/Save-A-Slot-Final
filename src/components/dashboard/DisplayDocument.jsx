import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import PropTypes from "prop-types";

const DisplayDocument = ({ collectionName, documentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          console.log("No such document!");
          setError("Document not found");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [collectionName, documentId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 1)}</pre>
    </div>
  );
};

DisplayDocument.propTypes = {
  collectionName: PropTypes.string.isRequired,
  documentId: PropTypes.string.isRequired,
};

export default DisplayDocument;
