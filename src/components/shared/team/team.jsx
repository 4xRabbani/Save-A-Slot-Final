import Adam from "/Adam.jpg";
import Richard from "/Richard.jpg";
import Lijith from "/Lijith.jpg";
import Michael from "/Michael.jpg";
import { FaLinkedin, FaGithub } from "react-icons/fa";

function Team() {

    return(
        <div className="jumbotron-fluid teambg">
        <h1 className="title container text-white text-center font-weight-bold">Our Team</h1>
        <div className="container team">
            
            
            <div className="card">
                <img src={ Lijith } alt="Lijith Wijesinghe" className="zoom-out" />
                <h3>Lijith Wijesinghe</h3>
                <p className="role"></p>
                <p>Passionate leader with a vision for innovation and growth.</p>
                <div className="social-icons">
                    <a href="https://www.linkedin.com/in/lijith-wijesinghe/" target="_blank" className="icon linkedin">
                        <FaLinkedin size={50} />
                    </a>
                    <a href="https://github.com/Lucer007" target="_blank" className="icon github">
                        <FaGithub size={50} />
                    </a>
                </div>
                <p />
            </div>

            <div className="card">
                <img src={ Adam } alt="Adam Rabbani" />
                <h3>Adam Rabbani</h3>
                <p className="role"></p>
                <p>Tech enthusiast driving the company's digital transformation.</p>
                <div className="social-icons">
                    <a href="https://www.linkedin.com/in/adam-rabbani/" target="_blank" className="icon linkedin">
                        <FaLinkedin size={50} />
                    </a>
                    <a href="https://github.com/4xRabbani" target="_blank" className="icon github">
                        <FaGithub size={50} />
                    </a>
                </div>
                <p />
            </div>

            <div className="card">
                <img src={ Richard } alt="Richard Mauricio" />
                <h3>Richard Mauricio</h3>
                <p className="role"></p>
                <p>Creative mind behind our unique and compelling designs.</p>
                <div className="social-icons">
                    <a href="https://www.linkedin.com/in/richard-mauricio/" target="_blank" className="icon linkedin">
                        <FaLinkedin size={50} />
                    </a>
                    <a href="https://github.com/Hieroglyfic" target="_blank" className="icon github">
                        <FaGithub size={50} />
                    </a>
                </div>
                <p />
            </div>

            <div className="card">
                <img src={ Michael } alt="Michael Bakshi" />
                <h3>Michael Bakshi</h3>
                <p className="role"></p>
                <p>Strategic thinker connecting our brand with the right audience.</p>
                <div className="social-icons">
                    <a href="https://www.linkedin.com/in/michaelbakshi/" target="_blank" className="icon linkedin">
                        <FaLinkedin size={50} />
                    </a>
                    <a href="https://github.com/bakshi" target="_blank" className="icon github">
                        <FaGithub size={50} />
                    </a>
                </div>
                <p />
            </div>
        </div>
        <br />
    </div>
    );
}

export default Team;