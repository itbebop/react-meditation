import React from "react";
import { Carousel } from "flowbite-react";

const Home = () => {
  return (
    <div className="bg-neutralSilver">
      <div className="px-4 lg:px-14 max-w-screen-2xl mx-auto min-h-screen h-screen">
        <div className="h-56 sm:h-64 xl:h-[500px] 2xl:h-[600px] mt-20">
          <Carousel slideInterval={3000}>
            <img src="https://picsum.photos/id/237/1200/600" alt="Slide 1" />
            <img src="https://picsum.photos/id/1015/800/400" alt="Slide 2" />
            <img src="https://picsum.photos/id/1016/800/400" alt="Slide 3" />
            <img src="https://picsum.photos/id/1025/800/400" alt="Slide 4" />
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Home;
