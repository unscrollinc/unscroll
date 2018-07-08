from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def get_page_source():

    chrome_options = Options()
    chrome_options.add_argument("user-data-dir=/Users/ford/Library/Application Support/Google/Chrome/Profile 1/") 
    driver = webdriver.Chrome("/Users/ford/Desktop/chromedriver", chrome_options=chrome_options)
    
    url = 'https://www.metmuseum.org/api/collection/collectionlisting?artist=&department=&era=&geolocation=&material=&offset={}&pageSize=0&perPage=100&showOnly=withImage&sortBy=Relevance&sortOrder=asc'

    driver.get(url)

    html_page = driver.page_source
    print(html_page)
    driver.quit()


get_page_source()
