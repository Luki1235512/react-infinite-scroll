import {ApolloClient, gql, InMemoryCache, NetworkStatus, useQuery} from "@apollo/client";
import {InView} from "react-intersection-observer";
import {useState} from "react";
import {offsetLimitPagination} from "@apollo/client/utilities";


const client = new ApolloClient({
    uri: "https://api.spacex.land/graphql/",
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    launchesPast: offsetLimitPagination()
                }
            }
        }
    })
})

const LAUNCHES_LIST = gql(`
    query LaunchesList($offset: Int!, $limit: Int!) {
        launchesPast(
            offset: $offset
            limit: $limit
        ) {
            id
            mission_name
        }
    }
`)


export default function InfiniteScrollComponent() {

    const [fullyLoaded, setFullyLoaded] = useState(false)
    const {data, networkStatus, error, fetchMore, variables} = useQuery(LAUNCHES_LIST, {
        client,
        notifyOnNetworkStatusChange: true,
        variables: {
            offset: 0,
            limit: 40
        }
    })


    if (networkStatus === NetworkStatus.loading) return <div>"Loading..."</div>
    if (error) return <pre>{error.message}</pre>


    return (
        <div>
            <h1>Infinite Scroll</h1>
                {data.launchesPast.map(launch => (
                    <li key={launch.id}>{launch.mission_name}</li>
                ))}
            <div>
                {networkStatus !== NetworkStatus.fetchMore
                    && data.launchesPast.length % variables.limit === 0 && !fullyLoaded && (
                    <InView
                        onChange={async (inView) => {
                            if (inView) {
                                const result = await fetchMore({
                                    variables: {
                                        offset: data.launchesPast.length
                                    }
                                })
                                setFullyLoaded(!result.data.launchesPast.length)
                            }
                        }}
                    />
                )}
            </div>
        </div>
    )

}
