import React from "react";
import { Carousel } from "react-responsive-carousel";

const getConfigurableProps = () => ({
    showArrows: true,
    showStatus: false,
    showIndicators: false,
    infiniteLoop: true,
    showThumbs: false,
    useKeyboardArrows: false,
    autoPlay: true,
    stopOnHover: true,
    swipeable: true,
    dynamicHeight: false,
    interval: 5000,
    transitionTime: 350,
    swipeScrollTolerance: 5,
});

export default () => (
    <Carousel {...getConfigurableProps()}>
        <div>
        <picture>
            <source srcSet="img/hero-compact.svg"
                    media="(max-width: 767px)"/>
            <source srcSet="img/hero-compact.svg"
                    media="(min-width: 768px)"/>
            <img src="img/hero-compact.svg" alt="Illustration showing login box with callouts explaining features"></img>
            </picture>
          {/* 
            <picture>
            <source srcSet="img/hero-mobile.png"
                    media="(max-width: 767px)"/>
            <source srcSet="img/hero.png"
                    media="(min-width: 768px)"/>
            <img src="img/hero.png" alt="Illustration showing login box with callouts explaining features"></img>
            </picture>
          */}
        </div>
        {/* 
        <div>
            <picture>
            <source srcSet="img/hero-mobile2.png"
                    media="(max-width: 767px)"/>
            <source srcSet="img/hero2.png"
                    media="(min-width: 768px)"/>
            <img src="img/hero2.png" alt="Illustration showing user management with callouts explaining features"></img>
            </picture>
        </div> */}
    </Carousel>
)
