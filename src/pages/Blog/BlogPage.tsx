import { useState } from "react";
import { Page } from "../../components/shared/Page";
import { mindmaps, type Mindmap } from "../../data/mindmaps";
import diaryPhoto from "../../assets/自拍.jpeg";

export function BlogPage() {
  const [activeMindmap, setActiveMindmap] = useState<Mindmap | null>(null);

  return (
    <Page
      title="Blog"
      subtitle="Technical writing"
      intro="Notes, essays, and technical deep dives."
    >
      <section>
        <div className="stack">
          <h2>Posts</h2>
          <div className="card stack">
            <img src={diaryPhoto} alt="Diary photo" />
            <div className="small">18 June 2024</div>
            <h3>关于我在这个网页的第一个 blog</h3>
            <p>
              这是我在这个平台上写下的第一篇博客。上面的照片是两周前我在
              Tesco 超市购物时，顺便对着自助购物机器的摄像头拍下的。当时正值暑假来临，
              我将在这个暑假完成我研究生生涯的最后任务——毕业设计。这也是我作为学生的最后几个月，
              我正在准备找工作。
            </p>
            <p>
              我总觉得心有不甘似乎在自己的大学生涯里没有尝试什么新东西，自己内心深处好像是那个
              18 岁的孩子，但是无论和我的同龄人还有比我年轻的人相处我都是感觉的浑身不自在，我总是想把
              自己流放到东南亚的某一个孤岛，但是又总觉得自己要直面很多事情，要承担更多责任，我只能趁我还年轻
              多学，多试着走出我的舒适区。
            </p>
            <p>今天的记录都到此为止。</p>
          </div>
        </div>
      </section>

      <section>
        <div className="stack">
          <div className="stack">
            <h2>Mindmaps</h2>
            <p className="small">
              Browse, preview, and download study mindmaps.
            </p>
          </div>
          <div className="grid-3">
            {mindmaps.map((map) => (
              <div key={map.id} className="card stack">
                <div className="stack">
                  <h3>{map.title}</h3>
                  {map.summary ? <p>{map.summary}</p> : null}
                  {map.tags && map.tags.length ? (
                    <div className="tags">
                      {map.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="small">Updated {map.updatedAt}</div>
                </div>
                <div className="card-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() => setActiveMindmap(map)}
                  >
                    Preview
                  </button>
                  <a className="button ghost" href={map.file} target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <a className="button ghost" href={map.file} download>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeMindmap ? (
        <dialog open className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <div className="small">Preview</div>
                <h3>{activeMindmap.title}</h3>
              </div>
              <button
                className="button ghost"
                type="button"
                onClick={() => setActiveMindmap(null)}
              >
                Close
              </button>
            </div>
            <object
              data={activeMindmap.file}
              type="application/pdf"
              className="pdf-preview"
            >
              <p className="small">
                Your browser cannot preview PDFs. Use Open or Download instead.
              </p>
            </object>
          </div>
        </dialog>
      ) : null}
    </Page>
  );
}
