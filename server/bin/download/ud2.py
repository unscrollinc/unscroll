import edtf
import dateparser
import spacy
spacy.load('en')

# https://www.theguardian.com/media/2018/sep/14/john-wilcock-obituary

def to_int(s):
    try:
        return int(s)
    except Exception:
        return None


AUDIO_FILE_DATE_REGEX = r'\d{4}|\d{2}|x{2}'

re.find(r'\d{4}|\d{2}|x{2}', '1943-01-03-CBS-World-News-Today.mp3')

def is_audio_file_date(s):
    _matches = re.findall(AUDIO_FILE_DATE_REGEX, s)

def convert_audio_file_date(s):

    _matches = re.findall(AUDIO_FILE_DATE_REGEX)
    _year = to_int(matches[0]))
    _month = to_int(matches[1])
    _day = to_int(matches[2])

    if _year < 100:
        _year = _year + 1900
    
    if (_day and _month and _year):
        dt = datetime.date(_year, _month, _year)
        
    if (_month and _year):
        dt = datetime.date(_year, _month, _year)        

        
        
    
class UnscrollDate():
    original_text = None
    is_timelike = None

    # dateparser
    # parse_edtf
    # edtf
    # each of spacy ents
    # tokenize by dashes
    'YYMMDD'
    'YY-MM-DD'
    'YY-xx-xx'
    'YY-MM-xx'
    '((19)?\d{2})-({\d+}|xx)-({\d+}|xx)'
    

    def __init__(self, text):
        self.original_text = text

    def recognize(self):
        [(s.text, s.as_doc().ents) for s in d.sents]



        
        
