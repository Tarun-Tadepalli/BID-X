import React, { useState, useEffect } from "react";
import './smhn1.css';
import { callApi, errorResponse, setSession, getSession } from './main';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import SellerNav from "./components/SellerNav";
import Header from "./components/Header";

// Product component
const Product = ({ product }) => {
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(product.Pdate, product.Ptime));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining(product.Pdate, product.Ptime));
        }, 1000);
        return () => clearInterval(timer);
    }, [product.Pdate,product.Ptime]);

    function calculateTimeRemaining(date, time) {
        const targetDate = new Date(date + "T" + time);
        const now = new Date();
        const timeRemaining = targetDate - now;
        if (timeRemaining <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds };
    }

    return (
        <div className="item">
            <img src={`./images/bids/${product.username}/${product.Pimgurl}`} alt="" className="ProImg" />
            <h2>{product.Pproduct}</h2>
            <div className="price">${product.Prprice}</div>
            <p className="Bdes">{product.Pdes}</p>
            <h4>{product.Pdate} {product.Ptime}</h4>
            <div className="usB">
                <img src={`./images/photo/${product.username}.jpg`} alt="" className="dpBid" />
                <p className="usBT">{product.username}</p>
            </div>
            <div className="countdown">
                <p>Time Remaining: {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s</p>
            </div>
            <button className="addCart">Add To Cart</button>
        </div>
    );
}

const Trend = ({ changeColor }) => {
    changeColor("#fff");
    const [sid] = useState(getSession("sid"));
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (!sid) {
            window.location.replace("/BidX");
        }
    }, [sid]);
    useEffect(() => {
        if (sid) {
            const url = "http://localhost:5000/home/uname";
            const data = JSON.stringify({ username: sid });
            callApi("POST", url, data, loadUname, errorResponse);
        }
    }, [sid]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                callApi("POST", "http://localhost:5000/home/dashboard", "", loadProduct, errorResponse);
            } catch (error) {
                errorResponse(error);
            }
        };

        fetchData();
    }, []);
    
    const loadUname = (res) => {
        var data = JSON.parse(res);
        var HL1 = document.getElementById("HL1");
        var IM1 = document.getElementById('IM1');
        
        HL1.innerText = `${data[0].username}`;
        IM1.src = `data:image/jpeg;base64,${data[0].imgurl}`;
    }

    const loadProduct = (res) => {
        const productsData = JSON.parse(res);
        const sortedProducts = productsData.sort((a, b) => {
            const timeA = new Date(a.Pdate + "T" + a.Ptime);
            const timeB = new Date(b.Pdate + "T" + b.Ptime);
            return timeA - timeB;
        });
        setProducts(sortedProducts);
    }

    const logout = () => {
        setSession("sid", "", -1);
        window.location.replace("/BidX");
    };

    const topProf = () => {
        window.location.replace("/BidX/sprofile");
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredProducts = products.filter(product =>
        product.Pproduct.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ flexDirection:"row", display:"flex" }}>
            <div>
            <div class="whole" style={{ border:"1px solid #000000" , width:"240px",height:"740px"}}>
    
            <SellerNav onLogout={logout}/>
    </div>
            </div>
            <div className="outlet">
                <div className="sheaderB" onClick={topProf}>
                    <Header></Header>
                </div>
                <h1><i class="bi bi-bar-chart"></i>Trending</h1>
                
                <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={handleSearch} 
                    placeholder="Search for products..." 
                    title="Type in a product name" 
                    className="searchInput"
                />
                <FontAwesomeIcon icon={faSearch} className="searchIcon" />
                <div className="listProduct">
                    {filteredProducts.map(product => (
                        <Product key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Trend;
