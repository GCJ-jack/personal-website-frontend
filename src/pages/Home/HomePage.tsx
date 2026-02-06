import { Page } from "../../components/shared/Page";
import profilePicture from "../../assets/profilepicture.jpg";
import sheffieldLogo from "../../assets/sheffieldlogo.jpg";
import bristolLogo from "../../assets/bristoluniversity.jpg";
import webDevIcon from "../../assets/webdevep.png";
import aiIcon from "../../assets/aiicon.png";
import roboticsIcon from "../../assets/robotics icon.png";
import mobileIcon from "../../assets/phone app develop.png";

export function HomePage() {
  return (
    <Page
      title="郭超军"
      subtitle="Software Engineer"
      intro="你好，我是郭超军，这是我的个人网站。"
    >
      <section>
        <div className="card stack">
          <div className="profile-grid">
            <div className="profile-media">
              <img
                src={profilePicture}
                alt="Profile portrait"
                className="profile-image"
              />
            </div>
            <div className="stack">
              <p>
                这是一个关于我的个人网站，是在我学习计算机接近四年之后，利用早已生疏的网页技术建立的网页。可以视作我的博客，这里也许会记载关于我的一些事情、一些感受、一些我去过的地方、看的演出、听的音乐、吃的食物，可能会是关于我的一切。如果感兴趣的话，就经常来看吧。同时也存在一些我的其他社交媒体链接。（其中可能会有一些我的观点，无意伤害任何人，求同存异，Peace and Love）
              </p>
              <div className="stack">
                <div>全名：郭超军</div>
                <div>国家：中国</div>
                <div>暂住：英国</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>Education</h2>
        <div className="grid-2">
          <div className="card stack">
            <h3>Sheffield University</h3>
            <img src={sheffieldLogo} alt="Sheffield University logo" />
            <div className="small">Bachelor of Science in Software Engineering</div>
            <div className="small">2020 - 2023</div>
          </div>
          <div className="card stack">
            <h3>Bristol University</h3>
            <img src={bristolLogo} alt="Bristol University logo" />
            <div className="small">Master of Science in Robotics</div>
            <div className="small">2023 - 2024</div>
          </div>
        </div>
      </section>

      <section>
        <h2>Technical Skills</h2>
        <div className="grid-2">
          <div className="card stack">
            <h3>Foundations</h3>
            <div className="small">
              Data structures, algorithms, computer networks, operating systems.
            </div>
          </div>
          <div className="card stack">
            <h3>Java & JVM</h3>
            <div className="small">
              Collections, multithreading, Java 8, reflection; JVM memory model
              and GC.
            </div>
          </div>
          <div className="card stack">
            <h3>Concurrency</h3>
            <div className="small">
              JUC, locks, thread pools, CountDownLatch, CyclicBarrier, Semaphore;
              basic AQS.
            </div>
          </div>
          <div className="card stack">
            <h3>Databases</h3>
            <div className="small">
              MySQL, SQL, indexing, transaction isolation, MVCC; tools: Workbench
              and DataGrip.
            </div>
          </div>
          <div className="card stack">
            <h3>Cache & Messaging</h3>
            <div className="small">
              Redis data structures; RabbitMQ (confirm/return, DLQ, delayed
              queues).
            </div>
          </div>
          <div className="card stack">
            <h3>Backend Frameworks</h3>
            <div className="small">
              Spring (IoC, AOP, MVC, transactions), MyBatis ORM & dynamic SQL.
            </div>
          </div>
          <div className="card stack">
            <h3>Language</h3>
            <div className="small">Fluent English; IELTS 6.5.</div>
          </div>
        </div>
      </section>

      <section>
        <h2>Interests</h2>
        <div className="grid-4">
          <div className="card stack">
            <h3>Web Development</h3>
            <img src={webDevIcon} alt="Web development icon" />
            <p>
              Web development involves creating and maintaining websites. It
              includes web design, publishing, programming, and database
              management.
            </p>
            <div className="small">HTML, CSS, JavaScript, React, Node.js</div>
          </div>
          <div className="card stack">
            <h3>Artificial Intelligence</h3>
            <img src={aiIcon} alt="Artificial intelligence icon" />
            <p>
              Artificial Intelligence focuses on systems that perform tasks
              normally requiring human intelligence.
            </p>
            <div className="small">Python, TensorFlow, Keras, PyTorch</div>
          </div>
          <div className="card stack">
            <h3>Robotics</h3>
            <img src={roboticsIcon} alt="Robotics icon" />
            <p>
              Robotics blends mechanical engineering, electronics, information
              engineering, and computer science to design and use robots.
            </p>
            <div className="small">ROS, C++, MATLAB, OpenCV</div>
          </div>
          <div className="card stack">
            <h3>Mobile Apps</h3>
            <img src={mobileIcon} alt="Mobile app icon" />
            <p>
              Mobile app development is the process of creating software
              applications that run on mobile devices.
            </p>
            <div className="small">Swift, Kotlin, Flutter, React Native</div>
          </div>
        </div>
      </section>

      <section>
        <h2>Contact</h2>
        <div className="grid-2">
          <div className="card stack">
            <div className="small">WeChat ID</div>
            <div>Njs-gcj</div>
          </div>
          <div className="card stack">
            <div className="small">Douban</div>
            <a
              href="https://www.douban.com/people/172489066/?_i=8413870xZ5Wh_H"
              target="_blank"
              rel="noreferrer"
            >
              Visit profile
            </a>
          </div>
          <div className="card stack">
            <div className="small">Instagram</div>
            <a
              href="https://www.instagram.com/u.knowhatimsayin/"
              target="_blank"
              rel="noreferrer"
            >
              @u.knowhatimsayin
            </a>
          </div>
          <div className="card stack">
            <div className="small">Gmail</div>
            <a href="mailto:3218818005g@gmail.com">3218818005g@gmail.com</a>
          </div>
        </div>
      </section>
    </Page>
  );
}
