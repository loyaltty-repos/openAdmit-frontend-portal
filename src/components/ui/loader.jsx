import { Ping } from 'ldrs/react'
import 'ldrs/react/Ping.css'

const Loader = () => {
    return (
        <div className="h-screen w-full flex items-center justify-center">
            {' '}
            {/* <div className="rounded-full h-20 w-20 bg-primary-3 animate-ping"></div> */}
            <Ping
                size="80"
                speed="1"
                color="#145044"
            />
        </div>

    );
};

export default Loader;
