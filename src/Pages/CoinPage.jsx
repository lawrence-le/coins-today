import axios from 'axios'
import CoinInfo from '../components/CoinInfo'
import ReactHtmlParser from "react-html-parser"
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CryptoState } from '../CryptoContext'
import { SingleCoin } from '../config/api'
import { numberWithCommas } from '../components/CoinsTable'
import { makeStyles, Typography, LinearProgress, Button } from '@material-ui/core'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const CoinPage= () => {
  const { id } = useParams()
  const [coin, setCoin] = useState()  

  const { currency, symbol, user, watchlist, setAlert } = CryptoState()

  const fetchCoin = async () => {
    const { data } = await axios.get(SingleCoin(id))

    setCoin(data)
  } 

  const inWatchlist = watchlist.includes(coin?.id)

  const addToWatchlist = async () => {
    const coinRef = doc(db, "watchlist", user.uid)
    try {
      await setDoc(
        coinRef,
        { coins: watchlist ? [...watchlist, coin?.id] : [coin?.id]}
      )
      setAlert({
        open: true,
        message: `${coin.name} added to the Watchlist !`,
        type: 'success'
      })
    } catch (error) {
      setAlert({
        open: true,
        message: error.message,
        type: 'error'
      })
    }
  }

  const removeFromWatchlist = async () => {
    const coinRef = doc(db, "watchlist", user.uid)
    try {
      await setDoc(
        coinRef,
        { coins: watchlist.filter((watch) => watch !== coin?.id) },
        { merge: "true" }
      )
      setAlert({
        open: true,
        message: `${coin.name} removed from the Watchlist !`,
        type: 'success'
      })
    } catch (error) {
      setAlert({
        open: true,
        message: error.message,
        type: 'error'
      })
    }
  }

  useEffect(() => {
    fetchCoin()
  }, [])

  const useStyles = makeStyles((theme) => ({
    container: {
      display: 'flex',
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
        alignItems: "center"
      }
    },
    sidebar: {
      width: "30%",
      [theme.breakpoints.down("md")]: {
        width: "100%",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: 25,
      borderRight: "2px solid grey",
    },
    heading: {
      fontWeight: "bold",
      marginBottom: 20, 
      fontFamily: "Inter"
    },
    description: {
      width: "100%",
      fontFamily: "Inter",
      padding: 25,
      paddingBottom: 15,
      paddingTop: 0,
      textAlign: "justify"
    },
    marketData: {
      alignSelf: "start",
      padding: 25, 
      paddingTop: 10,
      width: "100%",
      // Making it responsive
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "center",
      },
      [theme.breakpoints.down("md")]: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
      [theme.breakpoints.down("xs")]: {
        alignItems: "start",
      },
    }
  }))

  const classes = useStyles()

  if (!coin) return <LinearProgress style={{ backgroundColor: "#00b7ff"}} />

  return (
    <div className={classes.container}>
      <div className={classes.sidebar}> 
        <img 
          src={coin?.image.large} 
          alt={coin?.name}
          height="200"
          style={{ marginBlock: 20, height: '150px' }}
        />
        <Typography variant="h3" className={classes.heading}>
          {coin?.name}
        </Typography>
        <Typography variant="subtitle1" className={classes.description}>
          {ReactHtmlParser(coin?.description.en.split(". ")[0])}.
        </Typography>
        
        <div className={classes.marketData}>
          <span style={{ display: "flex"}}>
            <Typography variant="h5" className={classes.heading}>
              Rank:
            </Typography>
            &nbsp; &nbsp;
            <Typography variant="h5" style={{ fontFamily: "Inter"}}>
              {coin?.market_cap_rank}
            </Typography>
          </span>
          <span style={{ display: "flex"}}>
            <Typography variant="h5" className={classes.heading}>
              Current Price:
            </Typography>
            &nbsp; &nbsp;
            <Typography variant="h5" style={{ fontFamily: "Inter"}}>
              {symbol}{" "}
              {numberWithCommas(
                coin?.market_data.current_price[currency.toLowerCase()]
              )}
            </Typography>
          </span>
          <span style={{ display: "flex"}}>
            <Typography variant="h5" className={classes.heading}>
              Market Cap:
            </Typography>
            &nbsp; &nbsp;
            <Typography variant="h5" style={{ fontFamily: "Inter"}}>
              {symbol}{" "}
              {numberWithCommas(
                coin?.market_data.market_cap[currency.toLowerCase()]
                  .toString()
                  .slice(0, -6)
              )}M
            </Typography>
          </span>

          {user && (
            <Button
            variant="outlined"
            style={{
              width: "100%",
              maxWidth: "400px",
              height: 40,
              backgroundColor: inWatchlist ? "#ff0033" : "#00b7ff",
            }}
            onClick={inWatchlist ? removeFromWatchlist : addToWatchlist}
          >
            {inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          </Button>
          )}
        </div> 
      </div>

      {/* Chart */}
      <CoinInfo coin={coin} />
    </div>
  )
}

export default CoinPage
