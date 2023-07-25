import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  collection, // hold ref to the collection in the database (e.g. users, listings)
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter, //pagination?
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

//This page is rendered from Explore
function Category() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetchedListing, setLastFetchedListing] = useState(null)

  const params = useParams() //see reminder below
  /*
  //* As per usual, we fetch async'ly from the database as we would from a website
  we cannot directly do async from the useEffect function, so we create a function within a function.
  fetchListings is a async function that gets a reference to the collection in Firestore db.
  Then fetches the listings for a particular category (rental or sale) using a query.

  Reminder: useParams. 
  The useParams hook returns an object. 
  The object keys are the parameter names declared in the path string in the Route definition, and 
  the values are the corresponding URL segment from the matching URL.

  In this route: <Route path='/category/:categoryName' element={<Category />} />
  category will get the value 'rental' or 'sale' and categoryName is the property
  {categoryName: 'rental'}
  */
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get reference to collection in db named listings.
        const listingsRef = collection(db, 'listings')
        // Create a query that returns a snapshot (Firebase lingo) of 10 listings
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
        // Execute query
        const querySnap = await getDocs(q) //returns a snapshot which we need to loop thru

        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchedListing(lastVisible)

        const listings = [] //create an empty array to hold listing elements

        querySnap.forEach((doc) => { //we need to drill down into the doc object get id, and data
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })

        setListings(listings) // set the useState variable for listings
        setLoading(false) // reset loading to false
      } catch (error) {
        toast.error('Could not fetch listings')
      }
    }

    fetchListings()
  }, [params.categoryName]) // dependency is categoryName. So this useEffect runs each time params.categoryName changes

  // Pagination / Load More
  const onFetchMoreListings = async () => {
    try {
      // Get reference
      const listingsRef = collection(db, 'listings')

      // Create a query
      const q = query(
        listingsRef,
        where('type', '==', params.categoryName),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchedListing),
        limit(10)
      )

      // Execute query.  Returns a document object containing the specified listing
      // We have one document that contains two collections (listings, users) which
      // comprises the data we want access to.
      const querySnap = await getDocs(q) 

      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchedListing(lastVisible)

      const listings = []
      //get the document id and the data from the querySnap and push into listings array
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })

      setListings((prevState) => [...prevState, ...listings]) //update state
      setLoading(false) // set loading to false
    } catch (error) {
      toast.error('Could not fetch listings')
    }
  }
  // When [Places for rent] or [Places for sale] links are clicked in the Explore component,
  // the below JSX is rendered
  return (
    <div className='category'>
      <header>
        <p className='pageHeader'> {/*header text is rendered conditionally depending on which link in Explore was clicked */}
          {params.categoryName === 'rent'
            ? 'Places for rent'
            : 'Places for sale'}
        </p>
      </header>
      {/*Check loading state before executing */}
      {/* if loading then show spinner else [if (listings and listings.length > 0) then renders list items else show no listings for this category]*/}
      {loading ? (<Spinner />) : listings && listings.length > 0 
        ? (
          <>
            <main>
              <ul className='categoryListings'> {/*recall listings is an array of listing items */}
               {listings.map((listing) => ( // the li tag is in the ListItem component
                  <ListingItem
                    listing={listing.data}
                    id={listing.id}
                    key={listing.id}
                  />
                ))} 
              </ul>
            </main>

            <br />
            <br />
            {lastFetchedListing && (
              <p className='loadMore' onClick={onFetchMoreListings}>
                Load More
              </p>
            )}
          </>
        ) : (<p>No listings for {params.categoryName}</p>)
      }
    </div>
  )
}

export default Category

