import Component from "../common/Component"
interface Page extends Component {
  render(): Promise<string>
  after_render(): Promise<void>
}

export default Page;